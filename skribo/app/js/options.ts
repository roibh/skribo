
// Saves options to chrome.storage
function save_options() {
    var juntas_server = (document.getElementById('juntas_server') as any).value;
    //var likesColor = (document.getElementById('like') as any).checked;
    chrome.storage.sync.set({
        juntas_server: juntas_server
        
    }, function () {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function () {
            status.textContent = '';
        }, 750);
    });
}
// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
        juntas_server: 'https://www.juntason.com'
         
    } as any, function (items: any) {
        (document.getElementById('juntas_server') as any).value = items.juntas_server;
       
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',save_options);