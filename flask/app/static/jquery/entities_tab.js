let addEntity = document.getElementById('newEntity');
let updateEntity = document.getElementById('updateEntity')
let removeEntity = document.getElementById('removeEntity')
let addent = document.getElementById('text_fields-addEntity').labels[0]
let addauths = document.getElementById('text_fields-addAuthID').labels[0]
let addterms = document.getElementById('text_fields-addSearchTerm').labels[0]

// initial checkbox value
$("[value='"+$("#entities-optionchecked").attr('entchecked') + "']").prop('checked', true)

$("#submit_add_ents").click(function(){
    if(addEntity.checked == true){
        request_string = 'new-entity'
    } else if(updateEntity.checked == true){
        request_string = 'update-entity'
    } 
    $('#entityform').attr('action', '/entities?addorremove=add&mode='+request_string)
    $('#entityform')[0].submit()
})

$("#submit_remove_vals").click(function(){
    if(updateEntity.checked == true){
        request_string = 'update-entity'
    } else if(removeEntity.checked == true){
        request_string = 'remove-entity'
    }
    $('#entityform').attr('action', '/entities?addorremove=remove&mode='+request_string)
    $('#entityform')[0].submit()
})

$("#submit_update_dict").click(function(){
    $('#entityform').attr('action', '/update_dict')
    $('#entityform')[0].submit()
})

// initial form display based on initial checkbox value
let which_checked = $("input[name='options']").filter(":checked")[0].id

if(which_checked == 'newEntity'){
    addent.innerHTML = 'New entity name:'
    addauths.innerHTML = "Authorization IDs for this new entity <br\> (separated by ';')"
    addterms.innerHTML = "Search terms for this new entity <br\> (separated by ';')"
    $('#submit_add_ents')[0].innerHTML='Add Entity'
    hideOnClick("newEntity", "hideAddEntity")
    hideOnClick("newEntity", "hideAddSearchTerm")
    hideOnClick("newEntity", "hideAddAuthID")
    hideOnClick("newEntity", "submit_remove_vals", "hide")
    hideOnClick("newEntity", "submit_add_ents")
} else if(which_checked == 'updateEntity'){
    addent.innerHTML = 'Rename Entity To:'
    addauths.innerHTML = "Add authorization IDs to selected entity <br\> (separated by ';')"
    addterms.innerHTML = "Add search terms to selected entity <br\> (separated by ';')"
    $('#submit_add_ents')[0].innerHTML='Update'
    $('#submit_remove_vals')[0].innerHTML='Remove selected authorization/search term<br/> (Will not remove entity)'
    hideOnClick("updateEntity", "hideAddEntity")
    hideOnClick("updateEntity", "hideAddSearchTerm")
    hideOnClick("updateEntity", "hideAddAuthID")
    hideOnClick("updateEntity", "submit_remove_vals")
    hideOnClick("updateEntity", "submit_add_ents")
} else if(which_checked == 'removeEntity'){
    hideOnClick("removeEntity", "hideAddEntity", "hide")
    hideOnClick("removeEntity", "hideAddSearchTerm", "hide")
    hideOnClick("removeEntity", "hideAddAuthID", "hide")
    hideOnClick("removeEntity", "hideAddAuthID", "hide")
    hideOnClick("removeEntity", "submit_add_ents", "hide")
    hideOnClick("removeEntity", "submit_remove_vals")

    $('#submit_remove_vals')[0].innerHTML='Remove selected entity'
}

// dynamic form display after page load
addEntity.addEventListener('change', function(){
    addent.innerHTML = 'New entity name:'
    addauths.innerHTML = "Authorization IDs for this new entity <br\> (separated by ';')"
    addterms.innerHTML = "Search terms for this new entity <br\> (separated by ';')"
    $('#submit_add_ents')[0].innerHTML='Add Entity'
    hideOnClick("newEntity", "hideAddEntity")
    hideOnClick("newEntity", "hideAddSearchTerm")
    hideOnClick("newEntity", "hideAddAuthID")
    hideOnClick("newEntity", "submit_remove_vals", "hide")
    hideOnClick("newEntity", "submit_add_ents")
})

updateEntity.addEventListener('change', function(){
    addent.innerHTML = 'Rename Entity To:'
    addauths.innerHTML = "Add authorization IDs to selected entity <br\> (separated by ';')"
    addterms.innerHTML = "Add search terms to selected entity <br\> (separated by ';')"
    $('#submit_add_ents')[0].innerHTML='Add/Rename'
    $('#submit_remove_vals')[0].innerHTML='Remove selected terms<br/> (Will not remove entity)'
    hideOnClick("updateEntity", "hideAddEntity")
    hideOnClick("updateEntity", "hideAddSearchTerm")
    hideOnClick("updateEntity", "hideAddAuthID")
    hideOnClick("updateEntity", "submit_remove_vals")
    hideOnClick("updateEntity", "submit_add_ents")
})

removeEntity.addEventListener('change', function(){
    hideOnClick("removeEntity", "hideAddEntity", "hide")
    hideOnClick("removeEntity", "hideAddSearchTerm", "hide")
    hideOnClick("removeEntity", "hideAddAuthID", "hide")
    hideOnClick("removeEntity", "hideAddAuthID", "hide")
    hideOnClick("removeEntity", "submit_add_ents", "hide")
    hideOnClick("removeEntity", "submit_remove_vals")

    $('#submit_remove_vals')[0].innerHTML='Remove selected entity'
})


function hideOnClick(chk, txt, oncheck = 'show') {
    var checkBox = document.getElementById(chk);
    var text = document.getElementById(txt);
    if (checkBox.checked == true){
        if (oncheck == 'show'){
            text.style.display = "block";
        } else {
            text.style.display = "none";
        }     
    } 
}

let company_select = document.getElementById('info-entityKey');
let auth_select = document.getElementById('info-entityAuths');
let searchterms_select = document.getElementById('info-entitySearchTerms');

company_select.onchange = function() {
    company = company_select.value;
    
    fetch('/auths/' + company).then(function(response) {              
        response.json().then(function(data) {
            let optionHTML = '';

            for (let ent of data){
                optionHTML += '<option value = "'+ent +'">' + ent + '</option>';
            }

            auth_select.innerHTML = optionHTML;

        })
    })

    fetch('/searchTerms/' + company).then(function(response) {
        response.json().then(function(data) {
            let optionHTML = '';

            for (let ent of data){
                optionHTML += '<option value = "'+ent +'">' + ent + '</option>';
            }

            searchterms_select.innerHTML = optionHTML;

        })
    })
}
