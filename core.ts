import { Agent } from "./agents";


export async function Agent() {
    
}

export async function FindAgent(id:string) {
    
    const agent:Agent = {
        id: id,
        name: "X-Agent",
        description: "AI agent for the X social media platform",
        actions: [
            {
                name: "likePost",
                type: "Execution",
                function: ()=>{
                    console.log("post liked")
                }

            }
        ]
    }

    return agent
}