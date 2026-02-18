import mongoose from "mongoose";

const problemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "title cannot be empty"],
    },
    description: {
        type: String,
        required: [true, "description cannot be empty"],
    },
    difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
        required: [true, "Difficulty can be empty"],
        default: "easy",
    },
    testCases: [
        {
            input: {
                type: String,
                required: true
            },
            output: {
                type: String,
                require: true
            }
        }
    ],
    codeStubs : [
        {
            language: {
                type: String,
                enum: ["CPP", "PYTHON", "JAVA"],
                required: true
            },
            startSnippet: {
                type: String,
                required: true
            },
            endSnippet: {
                type: String,
                required: true
            },
            userSnippet: {
                type: String,
                required: true
            }
        }
    ],
    editorial: {
        type: String,
    }
});

const Problem = mongoose.model("Problem", problemSchema);
export default Problem;