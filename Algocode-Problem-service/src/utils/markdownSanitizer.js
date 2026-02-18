import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import TurndownService from "turndown";
function sanitizeMarkdown(markdownContent) {
    const turndownService = new TurndownService();
    // 1. convert markdown to html
    const convertedHtml = marked.parse(markdownContent);
    console.log(markdownContent);
    console.log(convertedHtml);
    //2. sanitize html
    const sanitizedHtml = sanitizeHtml(convertedHtml,{
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img'])
    });
    console.log(sanitizedHtml);
    //3. convert sanitizehtml back to markdown
    const sanitizedMarkdown = turndownService.turndown(sanitizedHtml);
    console.log(sanitizedMarkdown);
    return sanitizedMarkdown;
}

export default sanitizeMarkdown;