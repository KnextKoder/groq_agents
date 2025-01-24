# Groq Agents

Prebuilt task-specific AI agents running solely on Groq (Not Grok). *In development*

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
  - [GroqAgent](#groqagent)
    - [agents](#agents)
    - [selectAgent](#selectagent)
    - [call](#call)
    - [models](#models)
    - [create](#create)
- [Contributing](#contributing)
- [License](#license)

## Installation

To install the dependencies, run:

```sh
npm install
```
## Usage
To build the project, run:

```sh
npm run build
```

To use the `GroqAgent` class, import it and create an instance:

```ts
import GroqAgent from './dist/index';

async function Demo() {
    const client = new GroqAgent("api_key", 'llama3-70b-8192');
    console.log(client.models()); // logs all available models
    client.agents(); // logs all available agents
    const agent = client.create("Write a poem", "You are a poet");
    console.log(agent.messages[-1].content); // logs the last message content
}

Demo();
```

## API

#GroqAgent

#agents
Lists all the available agents and their agent id.
