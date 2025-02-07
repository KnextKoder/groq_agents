import * as fs from "fs/promises"
import * as path from "path"
import * as url from "url"
import { Logger } from "../utils"

/**
 * 
 * @param query describes a string of text to perform a websearch on
 */
async function WebSearch(query:string) {

}

async function FileExists(docPath:string) {
    Logger("Action", `Checking to see if document(s) exists at ${docPath}`, true, )
    try {
        await fs.access(docPath)
        return true
    } catch (error) {
        
        return false
    }
    
}
/**
 * 
 * @param docPath describes the path / location of the document to be processed
 */
async function ProcessDocument(docPath:string) {

}