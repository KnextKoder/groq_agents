# Groq Agents

Prebuilt task-specific AI agents running solely on Groq. *(Note: This project is currently under development.)*

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
  - [GroqAgent Class](#groqagent-class)
    - [agents()](#agents)
    - [selectAgent()](#selectagent)
    - [call()](#call)
    - [models()](#models)
    - [create()](#create)
- [Contributing](#contributing)
- [License](#license)

## Introduction

The `groq_agents` library provides a suite of prebuilt AI agents designed for specific tasks, all powered by Groq's advanced AI models. This library aims to simplify the integration of AI-driven functionalities into applications by offering ready-to-use agents tailored for various purposes.

## Features

- **Prebuilt Agents**: Access a variety of agents designed for specific tasks.
- **Groq-Powered**: Leverage the performance and capabilities of Groq's AI models.
- **Easy Integration**: Simple API for seamless integration into your projects.

## Get Started

To get started, install the groq-agents npm package

```bash
npm install groq-agents
```

## Installation 

To install the necessary dependencies, run:

```bash
npm install
```

## Usage

After building the project, you can utilize the `GroqAgent` class as follows:

```ts
import GroqAgent from './dist/index';

async function Demo() {
    const client = new GroqAgent("api_key", 'llama3-70b-8192');
    console.log(await client.models()); // Logs all available models
    console.log(await client.agents()); // Logs all available agents
    const agent = await client.create("Write a poem", "You are a poet");
    console.log(agent.messages[agent.messages.length - 1].content); // Logs the last message content
}

Demo();
```

**Note**: Ensure that you have built the project before running the above code:

```bash
npm run build
```

## API Reference

### GroqAgent Class

The `GroqAgent` class serves as the primary interface for interacting with Groq's AI agents.

#### agents()

Retrieves a list of all available agents.

**Usage**:

```javascript
const availableAgents = await client.agents();
console.log(availableAgents);
```

#### selectAgent(agentId)

Selects a specific agent by its ID.

**Parameters**:

- `agentId` (string): The ID of the agent to select.

**Usage**:

```javascript
client.selectAgent('agent_id');
```

#### call(input)

Sends input to the selected agent and retrieves the response.

**Parameters**:

- `input` (string): The input message to send to the agent.

**Usage**:

```javascript
const response = await client.call('Your input message');
console.log(response);
```

#### models()

Fetches a list of all available models.

**Usage**:

```javascript
const availableModels = await client.models();
console.log(availableModels);
```

#### create(prompt, context)

Creates a new agent with a specific prompt and context.

**Parameters**:

- `prompt` (string): The initial prompt for the agent.
- `context` (string): The context or role for the agent.

**Usage**:

```javascript
const newAgent = await client.create('Write a poem', 'You are a poet');
console.log(newAgent);
```

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes. Ensure that your code adheres to the project's coding standards and includes appropriate tests.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
