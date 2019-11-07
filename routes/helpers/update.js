const mongoose = require('mongoose');

const acl = require('../../acl');

const defaultPutMethod = async (id, type, user, model, body, res) => {
    const capType = type.toUpperCase();
    const lowType = type.toLowerCase();

    if(!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({err: `${capType}_ID_INCORRECT`, type: lowType, id});
    }

    const record = await model.findById(id);
    if (!record) return res.status(404).json({err: `${capType}_NOT_FOUND`, type: lowType,  id});

    const permission = await acl
        .can(user.role)
        .context({ requester: user._id.toString(), owner: record.author.toString() })
        .execute('update')
        .on(lowType);

    if (!permission.granted) return res.status(403).json({err: 'USER_NOT_AUTHORIZED', type: lowType,  id});

    return await updateModel(record, permission, body, res, `${capType}_SAVED`, `${capType}_UPDATE_FAILED`);
};

const updateModel = async (model, permission, requestBody, res, successMsg = 'RECORD_SAVED', errorMsg = 'RECORD_UPDATE_FAILED') => {
    const allUpdateFields = model.getUpdateFields();

    let updateFields;
    if (permission.attributes[0] === '*') {
        updateFields = allUpdateFields;
    } else {
        updateFields = allUpdateFields.filter(value => -1 !== permission.attributes.indexOf(value))
    }

    const warnings = [];
    for (let field of Object.keys(requestBody)) {
        if(updateFields.includes(field)) {
            model.set({[field]: requestBody[field]});
        } else {
            warnings.push({msg: 'FIELD_UPDATE_ERROR', data: field});
        }
    }

    try {
        await model.save();
        if (warnings.length) {
            return res.status(202).json({msg: successMsg, id: model._id, warnings })
        } else {
            return res.status(202).json({msg: successMsg, id: model._id})
        }

    } catch (err) {
        return res.status(400).json({err: errorMsg, msg: err});
    }
};

const defaultDeleteMethod = async (id, model, entityName, user, res) => {
    const lModel = entityName.toLowerCase();
    const uModel = entityName.toUpperCase();

    if(!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({err: `${uModel}_ID_INCORRECT`, id});
    }

    const record = await model.findOne({ _id: id });
    if (!record) return res.status(404).json({err: `${uModel}_NOT_FOUND`, id});

    const permission = await acl
        .can(user.role)
        .context({ requester: user._id.toString(), owner: record.author.toString() })
        .execute('delete')
        .on(lModel);
    if (!permission.granted) return res.status(403).json({err: 'USER_NOT_AUTHORIZED', userId: user._id, recordId: record._id, action: 'delete'});

    const { deletedCount } = await model.deleteOne({ _id: id });
    if (!deletedCount) return res.status(400).json({
        err: `${uModel}_DELETE_FAILED`,
        msg: `Mongo can\'t delete ${lModel}`,
        id,
    });

    return res.status(202).json({ msg: `${uModel}_DELETED`, id })
};

module.exports = {
    updateModel,
    defaultPutMethod,
    defaultDeleteMethod,
};
