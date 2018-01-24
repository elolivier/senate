var statistics = {
	"by_party": {
		"num_reps": [{
			"democrats": "0"},
	        {"republicans": "0"},
	        {"independents": "0"},
	        {"total": "0"
		}], 
		"pct_votes_w_party": [{
			"democrats": "0"},
	        {"republicans": "0"},
	        {"independents": "0"},
	        {"total": "0"
		}]
	},
	"by_member": {
		"most_engaged": [],
		"least_engaged": [],
		"most_loyal": [],
		"least_loyal": []
	}
};

$(function () {

	var dataLoader;
    var whichPage = $("#senatePage").hasClass("load-senate");

    if (whichPage) {
        dataLoader = "https://api.myjson.com/bins/1ftalf";
    } else {
        dataLoader ="https://api.myjson.com/bins/12lpgb"
    }

    $.getJSON(dataLoader, function(data) {

		var myData = data.results[0].members;

		//***********Update all values in statistics(JSON)***********
		//***********Updating statistics.by_party***********
		
		byParty(myData);

		//***********Updating statistics.by_member***********

		statistics.by_member.most_loyal = createHigherList(getLoyalty(myData), "pct_party_votes");
		
		var leastLoyal = createLowerList(getLoyalty(myData), "pct_party_votes").reverse();
		statistics.by_member.least_loyal = leastLoyal;

		var mostEngaged = createLowerList(getEngagement(myData), "pct_votes_missed").sort(function(member1, member2) {
				return +member1.pct_votes_missed - +member2.pct_votes_missed;
			});
		statistics.by_member.most_engaged = mostEngaged;

		statistics.by_member.least_engaged = createHigherList(getEngagement(myData), "pct_votes_missed");

		//***********Filling Table At a Glance***********

		var upTemplate = $("#table-by-party").html();
		var parties = ["Democrats", "Republicans", "Independents", "Total"];
		var dataParty = fillToMustache(statistics.by_party.num_reps, statistics.by_party.pct_votes_w_party, parties);

		var dataMustache = Mustache.render(upTemplate, dataParty);
		$("#up-table").html(dataMustache);

		//***********Filling Loyal/Engaged Tables***********

		var downTemplate = $("#template-down-tables").html();
		var dataLeast;
		var idTableLeast;
		var dataMost;
		var idTableMost;

		if ($("#downTables").hasClass("attendance")) {
			dataLeast = statistics.by_member.least_engaged;
			idTableLeast = "#least-table";

			dataMost = statistics.by_member.most_engaged;
			idTableMost = "#most-table";
		} else {
			dataLeast = statistics.by_member.least_loyal;
			idTableLeast = "#least-table";

			dataMost = statistics.by_member.most_loyal;
			idTableMost = "#most-table";
		}

		var dataDownMustache = Mustache.render(downTemplate, dataLeast);
		$(idTableLeast).html(dataDownMustache);

		var dataDownMustache = Mustache.render(downTemplate, dataMost);
		$(idTableMost).html(dataDownMustache);

		//**************CSS for tables**************
		$("th:not(:first-child)").css("text-align", "center");

		//**************Task 6**************
		$('table.display').DataTable({
	        "scrollY": "190px",
	        "dom": "ft",
	        "ordering": true,
	        "order": [],
	        "columnDefs": [
	        { "width": "45%", "targets": 0 }
	        ],
	        "paging": false,
	        "columnDefs": [
	        { "orderable": false, "targets": 0 }
	        ]	
    	});
    	$(".iframe").colorbox({iframe:true, width:"80%", height:"80%"});
	});
});

//***********Table by Party***********
//*********** Calculate data for first table and save it in statistic***********

function byParty(myData) {

	democrats = $.grep(myData, function(member) {return member.party === "D";});
	republicans = $.grep(myData, function(member) {return member.party === "R";});
	independents = $.grep(myData, function(member) {return member.party === "I";});

	statistics.by_party.num_reps[0] = democrats.length;
	statistics.by_party.num_reps[1] = republicans.length;
	statistics.by_party.num_reps[2] = independents.length;
	statistics.by_party.num_reps[3] = myData.length;

	statistics.by_party.pct_votes_w_party[0] = getAverage(democrats);
	statistics.by_party.pct_votes_w_party[1] = getAverage(republicans);
	statistics.by_party.pct_votes_w_party[2] = getAverage(independents);
	statistics.by_party.pct_votes_w_party[3] = getAverage(myData);
}

//**********Calculate the average of the property votes_with_party_pct of each array passed**********
function getAverage(array) {
	var add = array.reduce((a, b) => ({votes_with_party_pct: +a.votes_with_party_pct + +b.votes_with_party_pct}));
	var average = ((add.votes_with_party_pct) / array.length).toFixed(2);
    return average;
}

//***********Tables by Member***********
//********** Create an array of members with fields needed to do the math**********

function byMember(myData) {

	var members = [];

	$(myData).each(function(index) {

		var member = {member_name:"0", party_votes:"0", pct_party_votes:"0", votes_missed:"0", pct_votes_missed:"0", url:"0"};
		var name;
		var eachMember = myData[index];

		if (eachMember.middle_name == null) {
        	name = eachMember.first_name+" "+eachMember.last_name;
    	}	else {
        	name = eachMember.first_name+" "+eachMember.middle_name+" "+eachMember.last_name;
    	}

    	member.member_name = name;
		member.party_votes = ((+myData[index].total_votes * +myData[index].votes_with_party_pct) / 100).toFixed(0);
		member.pct_party_votes = +eachMember.votes_with_party_pct;
		member.votes_missed = +eachMember.missed_votes;
		member.pct_votes_missed = +eachMember.missed_votes_pct;
		member.url = eachMember.url;

		//Adding each member to the array members
		members.push(member);
	});
	return members;
}

//***********Calculate Loyalty***********
//********* Order array of members by % of votes with party and return it in an array
function getLoyalty(myData) {
	var membersLoyalty = byMember(myData).sort(function(member1, member2) {
		return +member1.pct_party_votes - +member2.pct_party_votes;
	});
	return membersLoyalty;
}

//***********Calculate Engagedment***********
//********* Order array of members by % of missed votes and return it in an array
function getEngagement(myData) {
	var membersEngagement = byMember(myData).sort(function(member1, member2) {
		return member1.pct_votes_missed - member2.pct_votes_missed;
	});
	return membersEngagement;
}

// higherOf is the array wanted to have top x% list. 
// property is the property of the array to use for reference(e.g. pct_votes_party). 

function createHigherList(higherOf, property) {

	var qttyOfElements = higherOf.length;
	var pctReq = 0.1;
	var iterations = qttyOfElements * pctReq;
	iterations = iterations.toFixed(0);
	var nextIterator = qttyOfElements - iterations;
	var highList = [];

	//Add 10% of data
	while(iterations > 0) {
		highList.push(higherOf[qttyOfElements -1]);
		iterations--;
		qttyOfElements--;
	}

	//Check if it is needed to add more data after 10%
	while((higherOf[nextIterator][property] == higherOf[nextIterator - 1][property]) && (nextIterator > 0)) {
		highList.push(higherOf[nextIterator -1]);
		nextIterator--;
	}
	return highList;
}

// lowerOf is the array wanted to have bottom x% list. 
// property is the property of the array to use for reference.

function createLowerList(lowerOf, property) {

	var qttyOfElements = lowerOf.length;
	var pctReq = 0.1;
	var iterations = qttyOfElements * pctReq;
	iterations = iterations.toFixed(0);
	var nextIterator = iterations;
	var lowList = [];

	//Add 10% of data
	while(iterations > 0) {
		lowList.push(lowerOf[iterations -1]);
		iterations--;
	}
	//Check if it is needed to add more data after 10%
	while((lowerOf[nextIterator][property] == lowerOf[nextIterator - 1][property]) && (nextIterator < qttyOfElements)) {
		lowList.push(lowerOf[nextIterator]);
		nextIterator++;
	}
	return lowList;
}

function fillToMustache(num, pct, parties) {
	var data_party = [];
	$(num).each(function(i, party) {
		data_party.push({"party":parties[i], "num_rep":num[i], "pct_votes":pct[i]});
	});
	return data_party;
}