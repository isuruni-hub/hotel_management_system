const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    roles: [
        {
            type: String,
            default: "Employee"
        }
    ],
    active: {
        type: Boolean,
        default: true
    },
    refreshToken: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);