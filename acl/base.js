const AccessControl = require('role-acl');

class ACL {
    constructor() {
        if (!ACL.instance) {
            ACL.instance = new AccessControl();
        }
    }

    getInstance() {
        return ACL.instance;
    }
}

module.exports = new ACL().getInstance();
