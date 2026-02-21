const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("../config/db");
const Employee = require("../models/employeeModel");
const Project = require("../models/projectSchema");

const migrateTeamLeaders = async () => {
    try {
        await connectDB();
        console.log("✅ Connected for migration...");

        let roleUpdates = 0;
        let historyAdds = 0;
        let leaderFixes = 0;

        const flaggedLeaders = await Employee.find({ teamLeader: true });
        for (const emp of flaggedLeaders) {
            if (emp.role !== "TeamLeader") {
                emp.role = "TeamLeader";
                await emp.save();
                roleUpdates += 1;
            }
        }

        const activeProjects = await Project.find({
            teamLeader: { $ne: null },
            status: { $ne: "Completed" },
        });

        for (const project of activeProjects) {
            if (!project.teamLeader) continue;
            const leader = await Employee.findById(project.teamLeader);
            if (!leader) continue;

            let changed = false;
            if (!leader.teamLeader) {
                leader.teamLeader = true;
                changed = true;
            }
            if (leader.role !== "TeamLeader") {
                leader.role = "TeamLeader";
                changed = true;
                leaderFixes += 1;
            }

            if (!leader.teamLeaderHistory) {
                leader.teamLeaderHistory = [];
            }
            const exists = leader.teamLeaderHistory.some(
                (entry) => entry.project?.toString() === project._id.toString(),
            );
            if (!exists) {
                leader.teamLeaderHistory.push({
                    project: project._id,
                    assignedAt: project.startDate || project.createdAt || new Date(),
                });
                changed = true;
                historyAdds += 1;
            }

            if (changed) {
                await leader.save();
            }
        }

        console.log(`✅ Roles updated: ${roleUpdates}`);
        console.log(`✅ Team leaders fixed from active projects: ${leaderFixes}`);
        console.log(`✅ TeamLeader history backfilled: ${historyAdds}`);
        process.exit(0);
    } catch (error) {
        console.error("❌ Migration failed:", error.message);
        process.exit(1);
    }
};

migrateTeamLeaders();
