import main from "./compiler.js";

const inputCode = document.querySelector(".inputs-code");
const outputCode = document.querySelector(".output-code");

const inputForm = document.querySelector(".inputform");

inputForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const inputVal = inputCode.value.split(/\r?\n/);
  try {
    const result = main(inputVal);
    console.log(result);
    outputCode.value = result;
  } catch (error) {
    outputCode.value = "";
    outputCode.value = `
        The Compiler is capable of doing simple 

                      variable declaration,
        
                      arithmetics, 
        
                      conditional and 
        
                      while loop 

                      ""Finally make sure 
                      you write syntatically 
                      correct code""`
  }
});
