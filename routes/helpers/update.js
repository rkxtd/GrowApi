const mongoose = require('mongoose');

const acl = require('../../acl');

const defaultPutMethod = async (id, type, user, model, body, res) => {
    const capType = type.toUpperCase();
    const lowType = type.toLowerCase();

    if(!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({message: `${capType}_ID_INCORRECT`, data: {type: lowType, id}});
    }

    const record = await model.findById(id);
    if (!record) return res.status(404).json({message: `${capType}_NOT_FOUND`, data: {type: lowType,  id}});

    const permission = await acl
        .can(user.role)
        .context({ requester: user._id.toString(), owner: record.author.toString() })
        .execute('update')
        .on(lowType);

    if (!permission.granted) return res.status(403).json({message: 'USER_NOT_AUTHORIZED', data: {type: lowType,  id}});

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
            warnings.push({message: 'FIELD_UPDATE_ERROR', field});
        }
    }

    try {
        await model.save();
        if (warnings.length) {
            return res.status(202).json({message: successMsg, data: { id: model._id, warnings }})
        } else {
            return res.status(202).json({message: successMsg, data: {id: model._id}})
        }

    } catch (err) {
        return res.status(400).json({message: errorMsg, data: {details: err}});
    }
};

const defaultDeleteMethod = async (id, model, entityName, user, res) => {
    const lModel = entityName.toLowerCase();
    const uModel = entityName.toUpperCase();

    if(!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({message: `${uModel}_ID_INCORRECT`, data: {id}});
    }

    const record = await model.findOne({ _id: id });
    if (!record) return res.status(404).json({message: `${uModel}_NOT_FOUND`, data: {id}});

    const permission = await acl
        .can(user.role)
        .context({ requester: user._id.toString(), owner: record.author.toString() })
        .execute('delete')
        .on(lModel);
    if (!permission.granted) return res.status(403).json({message: 'USER_NOT_AUTHORIZED', data: {userId: user._id, recordId: record._id, action: 'delete'}});

    const { deletedCount } = await model.deleteOne({ _id: id });
    if (!deletedCount) return res.status(400).json({
        message: `${uModel}_DELETE_FAILED`,
        data: {
            msg: `Mongo can\'t delete ${lModel}`,
            id,
        },
    });

    return res.status(202).json({ message: `${uModel}_DELETED`, data: {id}})
};

module.exports = {
    updateModel,
    defaultPutMethod,
    defaultDeleteMethod,
};
