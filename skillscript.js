

// 'use strict';
import skillsFile from "./skills.json";
import { createChatNodeDiv, getTestQuestion, clearChatBox } from "./script2.js";




// Extract only the arrays of prompts (roles plus trigger questions) from the full object created from the json file.
export const { prompts } = skillsFile

// Refer to initiation section of the page, where further elements such as input questions will be apppended.
const init = document.getElementById("initiation");

// Function to remove a section from the displayed HTML document
export function clearSection(section) {
    section.remove();
};
// Create object to hold the initial background info about the chat.
export const skillsIntro = {
    index: 0,
    skills: [],
    levels: [],
    summary: '',
    getSkills() {
        this.skills = prompts[this.index]['skills'];
    },
    getLevels() {
        this.levels = prompts[this.index]['levels'];
    }
  }
  export const test = new Map();
  export const testResults = new Array();

  function createTestData(thisTest){
    
    thisTest.set("skill", document.querySelector('input[name="skill"]:checked').value);
    thisTest.set("level", document.querySelector('input[name="level"]:checked').value);
    thisTest.set("totalquestions", Number(document.getElementById("questionRange").value));
    thisTest.set("score", 0);
    thisTest.set("counter", 0);
    return(thisTest);
}

// for each of the roles, create an entry with link in  the dropdown list and attach the text of the role.
const dropdownDiv = document.getElementById("dropdown-content");
for (let i = 0; i < prompts.length; i++) {

    const dropdownItem = document.createElement('a');
    dropdownItem.classList.add('role-list');
    dropdownItem.href = "#" + i;
    dropdownItem.innerText = prompts[i]['role'];
    // This adds a listen event which will also pass back the event to the handler function gatherInfo 
    dropdownItem.addEventListener("click", function (event) {
        const index = getIndex(event);
        skillsIntro.index = index;
        skillsIntro.getSkills();
        skillsIntro.getLevels();
        skillsIntro.summaryPrompt = prompts[index]['summaryprompt'];
        skillsIntro.finalPrompt = prompts[index]['finalprompt'];
        hideSelector();
        skillsToTest();
    });
    dropdownDiv.appendChild(dropdownItem);
}

// use the event parameter to target the role that was clicked, extract the number of the role from the href string by removing the first character (#)
function getIndex(clickEvent) {
    document.getElementById("roleSelector").classList.add("hidden");
    document.getElementById("show-results").classList.add("hidden");

    const index = clickEvent.target.getAttribute("href").slice(1);
    return index;
}
function hideSelector() {
    document.getElementById("roleSelector").classList.add("hidden");
}

function skillsToTest() {
    const resultSection = document.getElementById("result-section");
    resultSection.classList.add("hidden");
    const skillSection = document.createElement("section");
    skillSection.id = "initialQuestions";
    skillSection.classList.add("skillsection");
    init.insertAdjacentElement("afterend", skillSection);
    let skillSectionRow = document.createElement("div");
    // skillSectionRow.id = "initialQuestions";
    skillSectionRow.classList.add("skillsectionrow");
    skillSection.appendChild(skillSectionRow);
    showSkills(skillSectionRow);
    chooseLevel(skillSectionRow);
    showSlider(skillSectionRow);
    showButtons(skillSection);
}
// Slider to select the number of questions to ask
function showSlider(skillSection) {

    const sliderDiv = document.createElement("div");
    sliderDiv.classList.add("flexquestions");
    const chooseText = document.createElement("p");
    chooseText.innerText = "Select number of questions to answer."
    sliderDiv.appendChild(chooseText);
    const sliderElement = document.createElement("div");
    sliderElement.innerHTML = '<input type="range" min="1" max="10" value="2" step ="1" class="slider" id="questionRange"> <p>Value: <span id="numberQuestions"></span></p>';
    sliderDiv.appendChild(sliderElement);
    skillSection.appendChild(sliderDiv);
    const slider = document.getElementById("questionRange");
    let numQuestions = document.getElementById("numberQuestions");
    numQuestions.textContent = slider.value;
    // slider.addEventListener("input", showQuestionCount);
    slider.addEventListener("input", (event) => {
        numQuestions.textContent = event.target.value
    })

}

// Get the list of skill options from JSON file and display as radio  buttons.
function showSkills(skillSection) {
    const totalSkills = skillsIntro.skills.length;
    const skillDiv = document.createElement("div");
    skillDiv.classList.add("flexquestions");
    const chooseSkillText = document.createElement("p");
    chooseSkillText.innerText = "Choose one of the skills listed below for a multiple choice test."
    skillDiv.appendChild(chooseSkillText);
    // checkboxes if want to text multiple skills
    // for (let i = 0; i < totalSkills; i++) {

    //   const skillElement = document.createElement("div"); 
    //   skillElement.classList.add("initial_questions");
    //   const skillName = skillsIntro.skills[i];
    //   skillElement.innerHTML = `<input type="checkbox" id = ${skillName} name = "skill" value = ${skillName} /><label for = ${skillName}>${skillName}</label>`;
    //   skillSection.appendChild(skillElement);
    // }
    // radio buttons to test one skill at a time
    for (let i = 0; i < totalSkills; i++) {
        const skillElement = document.createElement("div");
        skillElement.classList.add("initial_questions");
        const skillName = skillsIntro.skills[i];
        const checkedText = i === 0 ? "checked" : "";
        skillElement.innerHTML = `<input type="radio" id = ${skillName}+i name = "skill" value = ${skillName} ${checkedText}/><label for = ${skillName}+i>${skillName}</label>`;
        skillDiv.appendChild(skillElement);
    }
    skillSection.appendChild(skillDiv);
}
// Get the list of skill levels from JSON file and display as radio  buttons.
function chooseLevel(skillSection) {
    const totalLevels = skillsIntro.levels.length;
    const skillDiv = document.createElement("div");
    skillDiv.classList.add("flexquestions");
    const chooseSkillText = document.createElement("p");
    chooseSkillText.innerText = "Choose the level of knowledge/experience."
    skillDiv.appendChild(chooseSkillText);

    for (let i = 0; i < totalLevels; i++) {
        const skillElement = document.createElement("div");
        skillElement.classList.add("initial_questions");
        const levelName = skillsIntro.levels[i];
        const checkedText = i === 0 ? "checked" : "";
        skillElement.innerHTML = `<input type="radio" id = ${levelName}+i name = "level" value = ${levelName} ${checkedText}/><label for = ${levelName}+i>${levelName}</label>`;
        skillDiv.appendChild(skillElement);
    }
    skillSection.appendChild(skillDiv);
}


function showButtons(section) {
    const skillSectionRow = document.createElement("div");
    skillSectionRow.classList.add("skillsectionrow");
    section.appendChild(skillSectionRow);

    const summarise = document.createElement("button");
    summarise.classList.add("dropbtn");
    summarise.innerText = "Begin Test";
    summarise.addEventListener("click", function () {
        runTest();
    })
    skillSectionRow.appendChild(summarise);

    const startAgain = document.createElement("button");
    startAgain.classList.add("resetbtn");
    startAgain.innerText = "Choose a different role";
    startAgain.addEventListener("click", function () {
        document.getElementById("roleSelector").classList.remove("hidden");
        if(testResults[0]) document.getElementById("show-results").classList.remove("hidden");
        clearSection(section);
    })
    skillSectionRow.appendChild(startAgain);

}
// code that runs the actual test
function runTest() {
    createTestData(test);
    renderTest(test);
    beginTest(test);
    // inputAnswersAndUpdateScores(test);
}

function renderTest(test){
    document.getElementById("heading").classList.add("hidden");
    document.getElementById("show-results").classList.add("hidden"); // 
    document.getElementById("initialQuestions").classList.add("hidden");
    document.getElementById("initialQuestions").classList.remove("skillsection");
    const chatSection = document.getElementById('chat');
    const testStart = document.createElement('div');
    testStart.setAttribute("id", "testStart");
    const testTitle = document.createElement('h4');
    testTitle.classList.add("para");
    testTitle.innerText = `Test of ${test.get("skill")} at ${test.get("level")} level`;
    testStart.appendChild(testTitle);
    chatSection.insertAdjacentElement("afterbegin", testStart);
    chatSection.classList.remove("hidden");
    document.getElementById("message-input-container").classList.add("hidden");
}

async function beginTest(test) {
    const str = skillsIntro.summaryPrompt;
    const strFinal = skillsIntro.finalPrompt;
    skillsIntro.systemMessage = str.replace("{skill}", test.get("skill")).replace("{level}", test.get("level"));
    skillsIntro.systemFinalMessage = strFinal.replace("{skill}", test.get("skill")).replace("{level}", test.get("level"));
    skillsIntro.sendSysAlways = true;
    // renderTest(test);
    // Create node in chat
    const firstNode = createChatNodeDiv();
    skillsIntro.node= firstNode;
    const userText = "First question please."
    const final = false;
    const firstQuestion = await getTestQuestion(userText, firstNode, final);
    

}



export async function  inputAnswersAndUpdateScores(answer){
    let questionCount = test.get("counter");
    const totalQuestions = test.get("totalquestions");
    if (!(questionCount===totalQuestions)){
        document.getElementById("message-input-container").classList.add("hidden");
        // questionCount++;
        // test.set("counter", questionCount);
        const newNode = createChatNodeDiv();
        skillsIntro.node= newNode;
        const final = false;
        const result = await getTestQuestion(answer, newNode, final);
        if(!((result.includes("Incorrect")) ||(result.includes("incorrect")))){
            let score = test.get("score");
            score++;
            test.set("score", score);
        }
    }else{
        document.getElementById("message-input-container").classList.add("hidden");
        const newNode = createChatNodeDiv();
        skillsIntro.node= newNode;
        const final = true;
        const userString = `My answer is ${answer}.  ${skillsIntro.systemFinalMessage}`
        const result = await getTestQuestion(userString, newNode, final);
        if(!((result.includes("Incorrect")) ||(result.includes("incorrect")))){
            let score = test.get("score");
            score++;
            test.set("score", score);
        }
        document.getElementById("message-input").classList.add("hidden");
        document.getElementById("send-button").classList.add("hidden");
    }
    
}

// In this function, cant simply push test into testResults because test has a single reference value in memory so every entry in testResults would point to the same (latest)  test map. 
export function endTest(){
    let resultArray = [];
    test.delete("lastquestion");
    for (const [key, value] of test){
        resultArray.push(value);
    }
    testResults.push(resultArray);
    clearChatBox();
    document.getElementById("show-results").classList.remove("hidden")
    document.getElementById("endtest-button").classList.add("hidden");
  }

  export function displayResults(){
    if(!testResults) return;
    const section = document.getElementById("result-section");
    clearResultSection();
    section.classList.remove("hidden");
    testResults.forEach(renderResult);
    // render each separate test result
    function renderResult(result){
      let [skill, level, questions, score, counter] = result;
      questions = (questions===counter) ? questions: questions-1;
      const correct = (questions>0) ? 100*score/questions: "No questions answered";
      const testDiv = document.createElement("div");
      testDiv.classList.add("test-div");
      const para = document.createElement("p");
      para.classList.add("para");
      para.innerText =` ${skill} - ${level}  (${questions} questions) `;
      testDiv.appendChild(para);
      const resultBar = document.createElement("div");
      resultBar.classList.add("result-container");
      const innerBar = document.createElement("div");
      innerBar.classList.add("skill-bar");
      let barColour = 'poor-result';
      if (correct>= 70){
        barColour = "good-result";
      }else if (correct>=40){
        barColour = "medium-result";
      } 
      innerBar.classList.add(barColour);
      innerBar.innerText = correct+"%";
      innerBar.setAttribute("style", `width:${correct}%`);
      resultBar.appendChild(innerBar);
      testDiv.appendChild(resultBar);
      section.appendChild(testDiv);
    }
  }

  function clearResultSection(){
    let testDivs = document.getElementsByClassName("test-div");
    while (testDivs.length >0){
      const thisDiv = testDivs[0];
      thisDiv.remove();
    }
  }



