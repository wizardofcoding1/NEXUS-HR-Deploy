const mongoose = require("mongoose");
const { encrypt, decrypt } = require("../utils/encryption");
const bankDetailsSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
            unique: true,
        },
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
        },

        accountHolderName: {
            type: String,
            required: true,
        },

        accountNumber: {
            type: String,
            required: true,
        },

        ifscCode: {
            type: String,
            required: true,
        },

        bankName: {
            type: String,
            required: true,
        },

        upiId: {
            type: String, // optional
        },
    },
    { timestamps: true },
);

bankDetailsSchema.pre("save", function () {
    if (this.isModified("accountNumber")) {
        this.accountNumber = encryptField(this.accountNumber);
    }

    if (this.isModified("ifscCode")) {
        this.ifscCode = encryptField(this.ifscCode);
    }

    if (this.isModified("upiId") && this.upiId) {
        this.upiId = encryptField(this.upiId);
    }

});

const looksEncrypted = (value) =>
    typeof value === "string" &&
    /^[0-9a-fA-F]{32}:[0-9a-fA-F]+$/.test(value);

const encryptField = (value) => {
    if (!value) return value;
    if (looksEncrypted(value)) return value;
    return encrypt(value);
};

bankDetailsSchema.pre("findOneAndUpdate", function () {
    const update = this.getUpdate() || {};
    const set = update.$set || update;

    if (set.accountNumber) {
        set.accountNumber = encryptField(set.accountNumber);
    }
    if (set.ifscCode) {
        set.ifscCode = encryptField(set.ifscCode);
    }
    if (set.upiId) {
        set.upiId = encryptField(set.upiId);
    }

    if (update.$set) {
        update.$set = set;
    } else {
        this.setUpdate(set);
    }
});

bankDetailsSchema.methods.decryptFields = function () {
    return {
        accountHolderName: this.accountHolderName,
        accountNumber: decrypt(this.accountNumber),
        ifscCode: decrypt(this.ifscCode),
        bankName: this.bankName,
        upiId: this.upiId ? decrypt(this.upiId) : null,
    };
};

module.exports = mongoose.model("BankDetails", bankDetailsSchema);
