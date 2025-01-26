# RoadMap

- [Stage_Zero](#stage_0)



## Stage_0

Stage 0 for `groq_agents` describes a list of requirements for the package to work, find them below:

- **A defined Schema for Generic agent creation**: There should be a schema that strictly defines what the body of an agent should look like.
- **Master Agent Works**: The master agent (currently called `Orchestrator Agent`) should work, and be able to operate independently of a user, only requiring an assigned task and returning an appropriate response.
- **Public api route for retrieving an agent's body based off its name**:
- **Public api route for retrieving an agent's body based on a description of the agent**: Use a Vector DB