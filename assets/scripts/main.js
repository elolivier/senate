$(function () {
    var dataLoader;
    var whichPage = $("#senatePage").hasClass("load-senate");
    if (whichPage) {
        dataLoader = "https://api.myjson.com/bins/1ftalf";
    } else {
        dataLoader ="https://api.myjson.com/bins/12lpgb"
    }
    $.getJSON(dataLoader, function(data) {
        
        var dataMembers = data.results[0].members;

        //************filling Table************
        var template = $("#data-template").html(); 
        var info = Mustache.render(template, data.results[0]);
        $("#table-data").html(info);

        $('table').DataTable({
            "scrollY": "300px",
            "dom": 'fltp',
            "lengthChange": false,
            "paging": false
        });
        $(".iframe").colorbox({iframe:true, width:"80%", height:"80%"});
        //**************CSS for tables**************
        $("th:not(:first-child)").css("text-align", "center");
 
        //************filling Dropdown************
        var dropList = $('#dropList');
        var dataDropdown = $("#data-dropdown").html();
        var states = [];

        $(dataMembers).each(function(index, member) {
            var exist = $.inArray(member.state, states);
            if (exist == -1) {
                states.push(member.state);
            }
        });
    
        states = states.sort();
        
        html = Mustache.render(dataDropdown, states);
        dropList.append(html);

        $('#dropList').change(showRow);
        $('#checkboxes input').click(showRow);
    });
});

//************Return an array of checkboxes checked************
function validateCheckboxes() {
    var selected = [];
    $('#checkboxes input:checked').each(function() {
        selected.push($(this).attr('id'));
    });
    return selected;
}

//**************Evaluating Filters**************
function validateFilters(row) {
    var partyOfRow = row.children[1].textContent;
    var stateOfRow = row.children[2].textContent;
    var stateSelected = $('#dropList option:selected').text();
    var checkSelected = validateCheckboxes();
    var showIt;

    if ((checkSelected.indexOf(partyOfRow) != -1) && (stateOfRow == stateSelected || 'All States' == stateSelected)) {
        showIt = true;
    } else {
        showIt = false;
    }
    return showIt;
}

//**************Showing Rows**************
function showRow() {        
    $("tbody tr").each(function(index, row){            
        if (validateFilters(row)) {
            $(row).show();
        } else {
            $(row).hide();
        }
    });
}

function clickName() {
    $("#name").click(function() {
        console.log(name);
    });
}