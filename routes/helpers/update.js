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

module.exports = {
    updateModel,
};
