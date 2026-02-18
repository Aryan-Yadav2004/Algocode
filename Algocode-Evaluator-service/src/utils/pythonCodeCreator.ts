export default function pythonCodeCreator(startingCode: string, middleCode: string, endCode: string) : string {
    return `
        ${startingCode}

        ${middleCode}

        ${endCode}
    `
};


/**
 * for python endcode can be passsed as empty string
 * 
 * for java end code can be passed as empty string
 */