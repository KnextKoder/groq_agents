# Groq Agents

Prebuilt task-specific AI agents running exclusively on Groq hardware. This project is currently under development.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
  - [GroqAgent Class](#groqagent-class)
    - [Methods](#methods)
      - [agents()](#agents)
      - [selectAgent(agentName)](#selectagentagentname)
      - [call(input)](#callinput)
      - [models()](#models)
      - [create(prompt, systemMessage)](#createprompt-systemmessage)
- [Contributing](#contributing)
- [License](#license)

## Installation

To install the necessary dependencies, run:

```bash
npm install
```

## Usage

To build the project, execute:

```bash
npm run build
```

Then, you can utilize the `GroqAgent` class as follows:

```javascript
import GroqAgent from './dist/index';

async function demo() {
    const client = new GroqAgent('your_api_key', 'llama3-70b-8192');
    console.log(await client.models()); // Logs all available models
    console.log(await client.agents()); // Logs all available agents
    const agent = client.create('Write a poem', 'You are a poet');
    console.log(agent.messages[agent.messages.length - 1].content); // Logs the last message content
}

demo();
```

Replace `'your_api_key'` with your actual Groq API key. You can obtain an API key by signing up at [Groq Console](https://console.groq.com/).

## API Reference

### GroqAgent Class

The `GroqAgent` class provides methods to interact with Groq's AI models and agents.

#### Methods

##### agents()

Retrieves a list of available agents.

**Returns:**

- `Promise<Array>`: An array of agent names.

**Example:**

```javascript
const availableAgents = await client.agents();
console.log(availableAgents);
```

##### selectAgent(agentName)

Selects a specific agent by name.

**Parameters:**

- `agentName` (string): The name of the agent to select.

**Returns:**

- `Object`: The selected agent object.

**Example:**

```javascript
const agent = client.selectAgent('agent_name');
console.log(agent);
```

##### call(input)

Sends input to the selected agent and retrieves the response.

**Parameters:**

- `input` (string): The input text to send to the agent.

**Returns:**

- `Promise<string>`: The agent's response.

**Example:**

```javascript
const response = await agent.call('Your input text');
console.log(response);
```

##### models()

Fetches a list of available models.

**Returns:**

- `Promise<Array>`: An array of model names.

**Example:**

```javascript
const availableModels = await client.models();
console.log(availableModels);
```

##### create(prompt, systemMessage)

Creates a new agent with a specific prompt and system message.

**Parameters:**

- `prompt` (string): The initial prompt for the agent.
- `systemMessage` (string): The system message defining the agent's behavior.

**Returns:**

- `Object`: The created agent object.

**Example:**

```javascript
const agent = client.create('Write a poem', 'You are a poet');
console.log(agent);
```

## Contributing

We welcome contributions to enhance this project. To contribute:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/YourFeature`.
3. Commit your changes: `git commit -m 'Add YourFeature'`.
4. Push to the branch: `git push origin feature/YourFeature`.
5. Open a pull request.

Please ensure your code adheres to the project's coding standards and includes appropriate tests.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

