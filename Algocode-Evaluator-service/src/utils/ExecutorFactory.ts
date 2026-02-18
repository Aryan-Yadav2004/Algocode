import CppExecutor from "../containers/cppExecutor.js";
import JavaExecutor from "../containers/javaExecutor.js";
import PythonExecutor from "../containers/pythonExecutor.js";
import type CodeExecutorStrategy from "../types/CodeExecutorStrategy.js";

export default function createExecutor(codeLanguage: string) : CodeExecutorStrategy | null {
    if(codeLanguage.toLowerCase() === "PYTHON".toLowerCase()){
        return new PythonExecutor(); 
    }
    else if(codeLanguage.toLowerCase() === "JAVA".toLowerCase()) {
        return new JavaExecutor();
    }
    else if(codeLanguage.toLowerCase() === "CPP".toLowerCase()){
        return new CppExecutor();
    }
    else {
        return null;
    }
}