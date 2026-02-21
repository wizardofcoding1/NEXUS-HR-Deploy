const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../../.env") });

const connectDB = require("../config/db");
const BankDetails = require("../models/bankDetailsModel");
const { encrypt } = require("../utils/encryption");

const looksEncrypted = (value) =>
    typeof value === "string" && /^[0-9a-fA-F]{32}:[0-9a-fA-F]+$/.test(value);

const migrate = async () => {
    await connectDB();

    const docs = await BankDetails.find({});
    const ops = [];
    let skipped = 0;

    docs.forEach((doc) => {
        const update = {};
        let changed = false;

        if (doc.accountNumber && !looksEncrypted(doc.accountNumber)) {
            update.accountNumber = encrypt(doc.accountNumber);
            changed = true;
        }

        if (doc.ifscCode && !looksEncrypted(doc.ifscCode)) {
            update.ifscCode = encrypt(doc.ifscCode);
            changed = true;
        }

        if (doc.upiId && !looksEncrypted(doc.upiId)) {
            update.upiId = encrypt(doc.upiId);
            changed = true;
        }

        if (changed) {
            ops.push({
                updateOne: {
                    filter: { _id: doc._id },
                    update: { $set: update },
                },
            });
        } else {
            skipped += 1;
        }
    });

    const result = ops.length ? await BankDetails.bulkWrite(ops) : null;
    console.log("BankDetails encryption migration complete");
    console.log("Total:", docs.length);
    console.log("Updated:", result ? result.modifiedCount || 0 : 0);
    console.log("Skipped:", skipped);

    await mongoose.connection.close();
    process.exit(0);
};

migrate().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});
