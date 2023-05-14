// 'use strict';

import { Configuration, OpenAIApi } from "./node_modules/openai";
import {skillsIntro, test, endTest, displayResults, inputAnswersAndUpdateScores} from "./skillscript";



// Set up the OpenAI API credentials
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
export const openai = new OpenAIApi(configuration);

const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
const endButton = document.getElementById("endtest-button");
const resultButton = document.getElementById("result-button");


export const chatBox = document.getElementById("chat-box");

// Add listener on the buttons
sendButton.addEventListener("click", sendAnswer);
endButton.addEventListener("click", endTest);
resultButton.addEventListener("click", displayResults);

// Send the text in input field on keypress "Enter" as well as clicking ths Send icon
messageInput.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    sendButton.click();
  }
});


// Creates a div within the page for the new user message + response.
export function createChatNodeDiv() {
  const chatNode = document.createElement("div");
  // Add a  node for  each pair (user input plus response to that input). Also add a popup to allow the chat to restart from that node.
  chatNode.classList.add("node");
  chatBox.appendChild(chatNode);
  return chatNode;
}

// Amend the system message depending if it is the final question
function getSystemMessageText(final){
  let systemMessageText = final ? skillsIntro.systemFinalMessage: skillsIntro.systemMessage ;
  return systemMessageText; 
  }

// function to take user's answer, display it in a chat bubble, and call the function which sends it to GPT
export function sendAnswer() {
  // Get the message text from the input field
  let userAnswer = messageInput.value;
  const chatNode = skillsIntro.node;
  // Create a new chat message element
  const messageElement = document.createElement("div");
  messageElement.classList.add("chat-message", "user");
  // Create a new user bubble element and add the message text to it
  const userBubble = document.createElement("div");
  userBubble.classList.add("user-bubble");
  userBubble.innerText = userAnswer;
  // make the user's answer more explicit for purpose of sending to chat engine
  userAnswer = `My answer to your last question is ${messageInput.value}`;
  // Add the user bubble to the message element
  messageElement.appendChild(userBubble);
  // Add the message element to the chat box
  chatNode.appendChild(messageElement);

  // Clear the message input field
  messageInput.value = "";
  // Update counter 
  let newCount = test.get("counter");
  newCount++;
  test.set("counter", newCount);
  // Send the message to ChatGPT and display the response
  inputAnswersAndUpdateScores(userAnswer);
}

export async function getTestQuestion(userMessage, node, final){
  document.getElementById("message-input-container").classList.add("hidden");
  const messageArray = [];
  messageArray[0] = {role:"system", content: getSystemMessageText(final)};
  // Works when you send the previous question as well as the user's answer to that question
  if (test.get("counter")!=0){
    messageArray.push({ role: "assistant", content: test.get("lastquestion")});
  }
  messageArray.push({ role: "user", content: userMessage });
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messageArray,
  });
  document.getElementById("message-input-container").classList.remove("hidden");
  document.getElementById("message-input").classList.remove("hidden");
  document.getElementById("send-button").classList.remove("hidden");
  document.getElementById("endtest-button").classList.remove("hidden");
  const responseMessage = completion.data.choices[0].message;
  displayChatGPTResponse(responseMessage.content, node);
  const question = responseMessage.content;
  test.set("lastquestion", question);
  return question;
}

// Function to display the response in a chat bubble
function displayChatGPTResponse(response, chatNode) {
  // Create a new chat message element
  const messageElement = document.createElement("div");
  messageElement.classList.add("chat-message", "chatgpt");

  // Create a new ChatGPT bubble element and add the response text to it
  const chatGPTBubble = document.createElement("div");
  chatGPTBubble.classList.add("chatgpt-bubble");
  chatGPTBubble.innerText = response;

  // Add the ChatGPT bubble to the message element
  messageElement.appendChild(chatGPTBubble);

  // Add the message element to the chat box
  chatNode.appendChild(messageElement);

  // showOrHideScoreButton();

  // Scroll to the bottom of the chat box
  chatBox.scrollTop = chatBox.scrollHeight;
  window.scrollTo(0, document.body.scrollHeight);
}


export function clearChatBox(){
  document.getElementById("testStart").remove();
  document.getElementById("message-input-container").classList.add("hidden");
  document.getElementById("heading").classList.remove("hidden");
  document.getElementById("roleSelector").classList.remove("hidden");
  let chatNodes = document.getElementsByClassName("node");
  while (chatNodes.length >0){
    const thisDiv = chatNodes[0];
    thisDiv.remove();
  }
  
}




