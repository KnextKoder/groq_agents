
export interface Action{
    /**
     * specific groq hosted model to use, the model must support tool use
     */
    name: string,
    /**
     * specific groq hosted model to use, the model must support tool use
     */
    type: "Execution" | "Retrieval"
    /**
     * specific groq hosted model to use, the model must support tool use
     */
    function: Function
}

export interface Agent {
    /**
     * specific groq hosted model to use, the model must support tool use
     */
    id: string,
    /**
     * specific groq hosted model to use, the model must support tool use
     */
    name: string,
    /**
     * specific groq hosted model to use, the model must support tool use
     */
    description: string
    /**
     * specific groq hosted model to use, the model must support tool use
     */
    actions: Action[]
}

const agent:Agent  = {
    id: "123456789",
    name: "X-Agent",
    description: "Agent for Interfacing with the X social media platform",
    actions: [
        {
            name: "create_post",
            type: "Execution",
            function: () => {

            }
        }
    ]
}