const input = document.getElementById("tarefaInput")
const lista = document.getElementById("listaTarefas")
const contador = document.getElementById("contador")


let tarefas = JSON.parse(localStorage.getItem("tarefas")) || []

function salvarTarefas(){
localStorage.setItem("tarefas", JSON.stringify(tarefas))
}

function atualizarContador(){
contador.textContent = "Total de tarefas: " + tarefas.length
}

function mostrarTarefas(){

lista.innerHTML = ""

tarefas.forEach((tarefa,index)=>{

const li = document.createElement("li")

li.textContent = tarefa.texto

if(tarefa.concluida){
li.classList.add("concluida")
}

li.onclick = ()=>{
tarefas[index].concluida = !tarefas[index].concluida
salvarTarefas()
mostrarTarefas()
}

const btn = document.createElement("button")
btn.textContent = "X"

btn.onclick = (e)=>{
e.stopPropagation()
tarefas.splice(index,1)
salvarTarefas()
mostrarTarefas()
}

li.appendChild(btn)

lista.appendChild(li)

})

atualizarContador()

}

function adicionarTarefa(){

if(input.value === "") return

tarefas.push({
texto: input.value,
concluida:false
})

input.value = ""
input.addEventListener("keypress", function(event){

if(event.key === "Enter"){
adicionarTarefa()
}

})

salvarTarefas()

mostrarTarefas()

}

mostrarTarefas()