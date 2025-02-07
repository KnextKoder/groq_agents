# RoadMap

- [Stage_Zero](#stage_0)
- [Stage_One](#stage_1)



## Stage_0

Stage 0 for `groq-agents` describes a list of requirements for the package to be stable and working and for anyone to easily test and deploy, find them below:

- **A defined Schema for Generic agent creation**: There should be a schema that strictly defines what the body of an agent should look like. [:white_check_mark:]

- **Master Agent Works**: The master agent (currently called `Master Agent`) should work, and be able to operate independently of a user, only requiring an assigned task and returning an appropriate response.[:white_check_mark:]

- **10 Locally Available Agents**: There should be at least 10 more agents (excluding the `Master Agnet`) that are locally available and can perform more complex/specialized tasks. [:yellow_circle:]

- **Quick Start UI**: There should be a standalone next js application with inituitive UI that shows how to interact with the agents. [:yellow_circle:]

## Stage_1

Stage 1 for `groq-agents`

- **Platform Launch**: There should be a platform built around the 

- **Public api route for retrieving agents based off a name**: https://www.groqagents.com/api/agentbody?name=agent_name [:yellow_circle:]

- **Public api route for retrieving agents based on a description of the agent**: Use a Vector DB... use upstash [:yellow_circle:]
