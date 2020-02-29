const list = document.querySelector('ul');
const titleInput = document.querySelector('#title');
const bodyInput = document.querySelector('#body');
const form = document.querySelector('form');
const submitBtn = document.querySelector('form button');

let db;

window.onload = function () {
   let request = window.indexedDB.open('notes_db', 1);

   request.onerror = function () {
      console.log('Falha ao abrir o Banco de Dados');
   };

   request.onsuccess = function () {
      console.log('Acesso ao Banco de Dados realizado');

      db = request.result;

      displayData();
   };

   request.onupgradeneeded = function (e) {
      let db = e.target.result;
      let objectStore = db.createObjectStore('notes_os', { keyPath: 'id', autoIncrement: true });

      objectStore.createIndex('title', 'title', { unique: false });
      objectStore.createIndex('body', 'body', { unique: false });

      console.log('Configuração do banco de dados concluída')
   };

   form.onsubmit = addData;
 
   function addData(e) {
      e.preventDefault();

      let newItem = {
         title: titleInput.value,
         body: bodyInput.value
      }
      console.log(newItem)
      let transaction = db.transaction(['notes_os'], 'readwrite');

      let objectStore = transaction.objectStore('notes_os');

      let request = objectStore.add(newItem);
      request.onsuccess = function() {
         titleInput.value = '',
         bodyInput.value = ''
      };

      transaction.oncomplete = function() {
         console.log('Transação feita: modificação no banco de dados realizado');

         displayData();
      };
      transaction.onerror = function() {
         console.log('Transação não aberta devido ao erro');
      };
   }

   function displayData() {
      while(list.firstChild) {
         list.removeChild(list.firstChild)
      }

      let objectStore = db.transaction('notes_os').objectStore('notes_os');
      objectStore.openCursor().onsuccess = function(e) {
         let cursor = e.target.result;
         console.log(cursor)
         if(cursor) {
            const listItem = document.createElement('li');
            const h3 = document.createElement('h3');
            const para = document.createElement('p');

            listItem.appendChild(h3);
            listItem.appendChild(para);
            list.appendChild(listItem);

            h3.textContent = cursor.value.title;
            para.textContent = cursor.value.body;

            listItem.setAttribute('data-note-id', cursor.value.id);

            const deleteBtn = document.createElement('button');
            listItem.appendChild(deleteBtn);
            deleteBtn.textContent = 'Delete'

            deleteBtn.onclick = deleteItem;

            cursor.continue();
         } else {
            if(!list.firstChild) {
               const listItem = document.createElement('li');
               listItem.textContent = 'Sem anotações guardadas';
               list.appendChild(listItem);
            }
            console.log('Todas as anotações exibidas')
         }

         function deleteItem(e) {
            let noteId = Number(e.target.parentNode.getAttribute('data-note-id'));
            
            let transaction = db.transaction(['notes_os'], 'readwrite');
            let objectStore = transaction.objectStore('notes_os');
            let request = objectStore.delete(noteId);

            transaction.oncomplete = function() {
               e.target.parentNode.parentNode.removeChild(e.target.parentNode);
               console.log(`Notação ${noteId} removida.`);
            }

            if(!list.firstChild) {
               let listItem = document.createElement('li');
               listItem.textContent = 'Sem anotações armazedas';
               list.appendChild(listItem);
            }
         };
      }
   }

}