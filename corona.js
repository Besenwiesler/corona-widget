// LICENCE: Robert Koch-Institut (RKI), dl-de/by-2-0

// URL of GitHub repository: https://github.com/Besenwiesler/incidence
// Fork of https://github.com/tzschies/incidence with minor adjustments only

// Vaccination API for RKI vaccination data: https://rki-vaccination-data.vercel.app
// Code to display vaccination data: https://gist.github.com/marco79cgn/b5f291d6242a2c530e56c748f1ae7f2c


/**
 * For configuration via widget parameters see:
 *
 * https://github.com/Besenwiesler/incidence/blob/main/README.md
 */

/*********************************************
 * CONFIGURATION PARAMETERS
 ********************************************/

// set to 'MeldeDatum' for the day when number of cases were reported
// set to 'RefDatum' for the day of start of illness
const datumType = 'MeldeDatum';

// because there are often late registrations some days later, 
// you can optionally display the incidence of yesterday 
// in most cases this is the more realistic value
// set to true for showing Incidence of Yesterday
// set to false for showing the API-Value of today
const showIncidenceYesterday = false;

/***************************************************************************
 * 
 * Defining Colors
 * 
***************************************************************************/

const COLOR_BG = new Color('#f8f8f8');
const COLOR_FG = Color.black();
const COLOR_INFECTED = new Color('#fe0000');
const COLOR_HEALTHY = new Color('#008800');

const TIER_1_COLOR = new Color('#fbf7c9'); // light yellow
const TIER_2_COLOR = new Color('#faee7e'); // yellow
const TIER_3_COLOR = new Color('#fab332'); // orange
const TIER_4_COLOR = new Color('#d03622'); // red
const TIER_5_COLOR = new Color('#931114'); // dark red
const TIER_6_COLOR = new Color('#671213'); // even darker red
const TIER_7_COLOR = new Color('#d80082'); // pink

const TIER_1_LIMIT = 0;
const TIER_2_LIMIT = 5;
const TIER_3_LIMIT = 25;
const TIER_4_LIMIT = 50;
const TIER_5_LIMIT = 100;
const TIER_6_LIMIT = 250;
const TIER_7_LIMIT = 500;

/***************************************************************************
 * 
 * API URLs
 * 
***************************************************************************/

const outputFields = 'GEN,RS,EWZ,EWZ_BL,BL_ID,cases,cases_per_100k,cases7_per_100k,cases7_bl_per_100k,last_update,BL';
const apiUrl = (location) => `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?where=1%3D1&outFields=${outputFields}&geometry=${location.longitude.toFixed(3)}%2C${location.latitude.toFixed(3)}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelWithin&returnGeometry=false&outSR=4326&f=json`;
const outputFieldsStates = 'Fallzahl,LAN_ew_GEN,cases7_bl_per_100k';

const GESAMTFAELLE = 'NeuerFall+IN%281%2C0%29';
const NEUE_FAELLE = 'NeuerFall+IN%281%2C-1%29';
const GESAMT_GESUND = 'NeuGenesen+IN%281%2C0%29';
const NEU_GESUND = 'NeuGenesen+IN%281%2C-1%29';
const GESAMT_TODESFAELLE = 'NeuerTodesfall+IN%281%2C0%29';
const NEUE_TODESFAELLE = 'NeuerTodesfall+IN%281%2C-1%29';

const apiUrlCasesLastDays = (GetLocation, StartDate) => `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?where=NeuerFall+IN%281%2C0%29${GetLocation}+AND+${datumType}+%3E%3D+TIMESTAMP+%27${StartDate}%27&objectIds=&time=&resultType=standard&outFields=AnzahlFall%2C${datumType}&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=${datumType}&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22value%22%7D%5D%0D%0A&having=&resultOffset=&resultRecordCount=&sqlFormat=none&f=pjson&token=`;
const apiUrlCases = (Filter, GetLandkreis) => `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?where=${Filter}${GetLandkreis}&objectIds=&time=&resultType=standard&outFields=AnzahlFall&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnDistinctValues=false&cacheHint=false&orderByFields=&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22value%22%7D%5D%0D%0A&having=&resultOffset=&resultRecordCount=&sqlFormat=none&f=pjson&token=`;
const apiUrlDivi = (GetLocation) => `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/DIVI_Intensivregister_Landkreise/FeatureServer/0//query?where=${GetLocation}&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=&returnGeometry=true&returnCentroid=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22faelle_covid_aktuell%22%2C%22outStatisticFieldName%22%3A%22faelle_covid_aktuell%22%7D%2C%0D%0A%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22faelle_covid_aktuell_beatmet%22%2C%22outStatisticFieldName%22%3A%22faelle_covid_aktuell_beatmet%22%7D%2C%0D%0A%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22betten_frei%22%2C%22outStatisticFieldName%22%3A%22betten_frei%22%7D%2C%0D%0A%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22betten_gesamt%22%2C%22outStatisticFieldName%22%3A%22betten_gesamt%22%7D%5D&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson&token=`;

/***************************************************************************
 * 
 * Global Variables
 * 
***************************************************************************/

const GET_DAYS = 35; // 5 Wochen
const WEEK_IN_DAYS = 7;
const EWZ_GER = 83020000;
const INCIDENCE_DAYS = 28; // 4 Wochen

const DELIMITER = ' ⚫︎ ';
const FONT_SIZE_INCIDENCE = 22;
const ROWS_HEIGHT = 16;
const ROWS_WIDTH = 140;

const STATES_SHORT = {
	'Baden-Württemberg': 'BW',
	'Bayern': 'BY',
	'Berlin': 'BE',
	'Brandenburg': 'BB',
	'Bremen': 'HB',
	'Hamburg': 'HH',
	'Hessen': 'HE',
	'Mecklenburg-Vorpommern': 'MV',
	'Niedersachsen': 'NI',
	'Nordrhein-Westfalen': 'NRW',
	'Rheinland-Pfalz': 'RP',
	'Saarland': 'SL',
	'Sachsen': 'SN',
	'Sachsen-Anhalt': 'ST',
	'Schleswig-Holstein': 'SH',
	'Thüringen': 'TH'
};

const STATES_VACCINATION_API = {
	'Baden-Württemberg': 'Baden-W\u00fcrttemberg',
	'Bayern': 'Bayern',
	'Berlin': 'Berlin',
	'Brandenburg': 'Brandenburg',
	'Bremen': 'Bremen',
	'Hamburg': 'Hamburg',
	'Hessen': 'Hesse ',
	'Mecklenburg-Vorpommern': 'Mecklenburg-Vorpommern',
	'Niedersachsen': 'Niedersachsen',
	'Nordrhein-Westfalen': 'Nordrhein-Westfalen',
	'Rheinland-Pfalz': 'Rheinland-Pfalz',
	'Saarland': 'Saarland',
	'Sachsen': 'Sachsen',
	'Sachsen-Anhalt': 'Sachsen-Anhalt',
	'Schleswig-Holstein': 'Schleswig-Holstein',
	'Thüringen': 'Th\u00fcringen',
};

const PCT_TREND_EQUAL = 5;
const PCT_TREND_INCREASE = 10;

let getGermany = false;
let getState = false;
let fixedCoordinates = [];
let individualName = '';
let isStats = false;
let isCustomRows = false;

let today = new Date();
let vaccinated;

let MEDIUMWIDGET = (config.widgetFamily === 'medium') ? true : false;

let ROWS = ['🧬', '💪', '📈', '🔴', '🟢', '🪦', '🏥', '🛌'];

/***************************************************************************
 * 
 * Initialization
 * 
***************************************************************************/

if (args.widgetParameter) {
	const parameters = args.widgetParameter.split(',');

	if (parameters.length >= 1) {
		if (parameters[0] == 1) { getState = true; }
		if (parameters[0] == 2) { getGermany = true; }
	}

	if (parameters.length >= 3) {
		fixedCoordinates = parseLocation(args.widgetParameter);
	}
	
	if (parameters.length >= 4) {
		let par = parameters[3].slice();
		if (par.length >= 1) {
			individualName = par;
		}
	}
	
	if (parameters.length >= 5) {
		let par = parameters[4].slice();
		if (par == 1) {
			isStats = true;
		}
	}
	
	if (parameters.length >= 6) {
		let par = parameters[5].slice();
		let characters = par.match(/./ug);
		if (typeof characters !== 'undefined' && characters) {
			if (characters.length >= 1) {
				ROWS = characters;
				isCustomRows = true;
			}
		}
	}
}

if (!config.runsInWidget) {
	MEDIUMWIDGET = true;
}

let data = await getData(0);
await getVaccinationData();
if (data && typeof data !== 'undefined') {
	if (!isCustomRows && MEDIUMWIDGET && !(getState || getGermany)) {
		ROWS = ['➖', '📈', '🔴', '🟢', '🪦', '🏥', '🛌', '➖'];
	}
	else if (!isCustomRows && !MEDIUMWIDGET && !(getState || getGermany)) {
		ROWS = ['📍', '➖', '📈', '🔴', '🟢', '🪦', '🛌', '🕰'];
	}
	else if (!isCustomRows && !MEDIUMWIDGET && (getState || getGermany)) {
		ROWS = ['📍', '➖', '🧬', '💪', '🔴', '🪦', '🛌', '🕰'];
	}
	
	const widget = await createWidget();
	widget.refreshAfterDate = new Date(Date.now() + 1 * 60 * 60 * 1000);
	
	if (!config.runsInWidget) {
		await widget.presentMedium();
	}
	
	Script.setWidget(widget);
	Script.complete();
} else { // no data
	Script.refreshAfterDate = new Date(Date.now() + 1 * 1 * 60 * 1000);
}

/***************************************************************************
 * 
 * Functions to display widget content
 * 
***************************************************************************/

async function createWidget() {
	const list = new ListWidget();
	list.setPadding(2, 5, 2, 5);
	const stack = list.addStack();
	stack.layoutHorizontally();

	if (MEDIUMWIDGET) {
		const left = stack.addStack();
		left.size = new Size(140, 140);
		left.layoutVertically();	
		createIncidenceBlock(left, data);
		
		stack.addSpacer(15);
		
		const right = stack.addStack();
		right.size = new Size(140, 140);
		right.layoutVertically();
		createStatsBlock(right, data);
	} else {
		const main = stack.addStack();
		main.size = new Size(140, 140);
		main.layoutVertically();
		main.useDefaultPadding();
			
		if (isStats) {
			createStatsBlock(main, data)
		} else {
			main.centerAlignContent();
			createIncidenceBlock(main, data);
		}
	}

	return list;
}

function createIncidenceBlock(list, data) {
	const headerWidth = 140;
	
	// Header: name of location

	const headerLabel = list.addStack();
	headerLabel.setPadding(0, 2, 2, 2);
	headerLabel.centerAlignContent();
	headerLabel.layoutHorizontally();
	headerLabel.size = new Size(headerWidth, 20);

	createHeader(headerLabel, data);
	
	list.addSpacer(15);
	
	// Incidence stack
	
	const inc = list.addStack();
	inc.layoutHorizontally();
	inc.centerAlignContent();
	inc.size = new Size(headerWidth, 30);
	const incStack = inc.addStack();
	
	// Incidence traffic light
	
	createIncidenceTrafficLight(incStack, data);
	incStack.addSpacer(5);
	
	// Incidence plus trend
	
	createIncidenceValueAndTrend(incStack, data);
	
	// Incidence graph

	list.addSpacer(15);
	
	createGraph(list, data);
	
	// Date

	list.addSpacer(1);
	const datestack = list.addStack();
	datestack.layoutHorizontally();
	datestack.centerAlignContent();
	createUpdatedLabel(datestack, data);
}

function createStatsBlock(list, data) {
	const right = list.addStack();
	right.layoutVertically();
	right.centerAlignContent();

	ROWS.forEach(function (item, index) {
			createRowBlock(item, right, data);
		right.addSpacer(1);
	});
	
}

function createHeader(stack, data) {
	const areanameLabel = stack.addText(data.areaName);
	areanameLabel.font = Font.boldSystemFont(15);
	areanameLabel.lineLimit = 1;
}

function createIncidenceTrafficLight(stack, data) {
	let areaIncidence = (showIncidenceYesterday) ? data.areaIncidenceLastWeek[data.areaIncidenceLastWeek.length - 1] : data.incidence;
	let incidence = Math.round(areaIncidence);
	
	// incidence traffic light
	
	const incidenceTrafficLight = stack.addText('●');
	incidenceTrafficLight.font = Font.boldSystemFont(FONT_SIZE_INCIDENCE);
	incidenceTrafficLight.textColor = getIncidenceColor(incidence);
}

function createIncidenceValueAndTrend(stack, data) {
	let areaIncidence = (showIncidenceYesterday) ? data.areaIncidenceLastWeek[data.areaIncidenceLastWeek.length - 1] : data.incidence;
	let incidence = Math.round(areaIncidence);
	 
	// incidence
	
	const incidenceLabel = stack.addText(incidence.toLocaleString());
	incidenceLabel.centerAlignText();
	incidenceLabel.font = Font.boldSystemFont(FONT_SIZE_INCIDENCE);
	
	stack.addSpacer(3);

	// trend
	
	let length = data.areaIncidenceLastWeek.length;

	const incidenceTrend = getTrendArrowFactor(parseFloat(data.r_factor_today).toFixed(3));
	const incidenceLabelTrend = stack.addText('' + incidenceTrend);
	incidenceLabelTrend.font = Font.boldSystemFont(FONT_SIZE_INCIDENCE);
	incidenceLabelTrend.centerAlignText();
	incidenceLabelTrend.textColor = getTrendColor(incidenceTrend);
}

function createRowBlock(row, s, data)	{
	const stack = s.addStack();
	stack.setPadding(2, 5, 2, 5);
	stack.centerAlignContent();
	stack.cornerRadius = 6;
	stack.size = new Size(ROWS_WIDTH, ROWS_HEIGHT);

	if (MEDIUMWIDGET && row === '📍') {
		row = '➖';
	}
	
	if (row === '🧬') {
		stack.backgroundColor = COLOR_BG;

		const vaccinationLabelSymbol = stack.addText('🧬 ');
		vaccinationLabelSymbol.font = Font.mediumSystemFont(11);
		stack.addSpacer(1);
		if (getGermany && typeof vaccinated !== 'undefined') {
			const vaccinationLabel = stack.addText(getRoundedNumber(vaccinated.vaccinated) + DELIMITER + vaccinated.quote.toFixed(1) + ' %');
			vaccinationLabel.font = Font.mediumSystemFont(11);
			vaccinationLabel.textColor = COLOR_FG;
		} else if (getState && typeof vaccinated !== 'undefined') {
			let state = data.stateVaccinationAPI;
					const vaccinationLabel = stack.addText(getRoundedNumber(vaccinated.states[state].vaccinated) + DELIMITER + vaccinated.states[state].quote.toFixed(1) + ' %');
			vaccinationLabel.font = Font.mediumSystemFont(11);
			vaccinationLabel.textColor = COLOR_FG;
		} else {
			const vaccinationLabel = stack.addText('');
			vaccinationLabel.font = Font.mediumSystemFont(11);
			vaccinationLabel.textColor = COLOR_FG;
		}

		stack.addSpacer();

		return;
	}

	else if (row === '💪') {
		stack.backgroundColor = COLOR_BG;

		const immuneLabelSymbol = stack.addText('💪 ');
		immuneLabelSymbol.font = Font.mediumSystemFont(11);
		stack.addSpacer(1);
		if (getGermany && typeof vaccinated !== 'undefined') {
			const vaccinatedNumber = vaccinated.vaccinated;
			const healthyNumber = data.areaHealthy;
			const totalNumber = vaccinated.total;
			const immuneNumber = vaccinatedNumber + healthyNumber;
			const immuneQuote = (immuneNumber / totalNumber) * 100;

			const immuneLabel = stack.addText(getRoundedNumber(immuneNumber) + DELIMITER + immuneQuote.toFixed(1) + ' %');
			immuneLabel.font = Font.mediumSystemFont(11);
			immuneLabel.textColor = COLOR_FG;
		} else if (getState && typeof vaccinated !== 'undefined') {
			let state = data.stateVaccinationAPI;
	
				const vaccinatedNumber = vaccinated.states[state].vaccinated;
			const healthyNumber = data.areaHealthy;
			const totalNumber = vaccinated.states[state].total;
			const immuneNumber = vaccinatedNumber + healthyNumber;
			const immuneQuote = (immuneNumber / totalNumber) * 100;

			const immuneLabel = stack.addText(getRoundedNumber(immuneNumber) + DELIMITER + immuneQuote.toFixed(1) + ' %');
			immuneLabel.font = Font.mediumSystemFont(11);
			immuneLabel.textColor = COLOR_FG;
		} else {
			const immuneLabel = stack.addText('');
			immuneLabel.font = Font.mediumSystemFont(11);
			immuneLabel.textColor = COLOR_FG;
		}

		stack.addSpacer();

		return;
	}

	else if (row === '🔴') {
		stack.backgroundColor = COLOR_BG;
	
		const casesLabelSymbol = stack.addText('🔴 ');
		casesLabelSymbol.font = Font.mediumSystemFont(11);
		stack.addSpacer(1);
	
		const casesNewLabel = stack.addText(formatCases(Math.abs(data.areaNewCases)));
	casesNewLabel.font = Font.mediumSystemFont(11);
		if (data.areaNewCases > 0) {
			casesNewLabel.textColor = COLOR_INFECTED;
		} else if (data.areaNewCases < 0) {
			casesNewLabel.textColor = COLOR_HEALTHY;
		}
	
		const casesDelimiterLabel = stack.addText(DELIMITER);
		casesDelimiterLabel.font = Font.mediumSystemFont(11);
		casesDelimiterLabel.textColor = COLOR_FG;
	
		const casesSumLabel = stack.addText(formatCases(data.areaCases));
		casesSumLabel.font = Font.mediumSystemFont(11);
		casesSumLabel.textColor = COLOR_INFECTED;
	
		stack.addSpacer();

		return;
	}

	else if (row === '🟢') {
		stack.backgroundColor = COLOR_BG;
	
		const healthyLabelSymbol = stack.addText('🟢 ');
		healthyLabelSymbol.font = Font.mediumSystemFont(11);
		stack.addSpacer(1);
	
		const healthyNewLabel = stack.addText(formatCases(data.areaNewHealthy));
		healthyNewLabel.font = Font.mediumSystemFont(11);
		healthyNewLabel.textColor = COLOR_HEALTHY;
	
		const healthyDelimiterLabel = stack.addText(DELIMITER);
		healthyDelimiterLabel.font = Font.mediumSystemFont(11);
		healthyDelimiterLabel.textColor = COLOR_FG;
	
		const healthySumLabel = stack.addText(formatCases(data.areaHealthy));
		healthySumLabel.font = Font.mediumSystemFont(11);
		healthySumLabel.textColor = COLOR_HEALTHY;
	
		stack.addSpacer();

		return;
	}

	else if (row === '🪦') {
		stack.backgroundColor = COLOR_BG;
	
		const deathsLabelSymbol = stack.addText('🪦 ');
		deathsLabelSymbol.font = Font.mediumSystemFont(11);
		stack.addSpacer(1);
		const deathsLabel = stack.addText(formatCases(data.areaNewDeaths) + DELIMITER + formatCases(data.areaDeaths));
		deathsLabel.font = Font.mediumSystemFont(11);
		deathsLabel.textColor = COLOR_FG;

		stack.addSpacer();
	
		return;
	}
	
	else if (row === '📈') {
		stack.backgroundColor = COLOR_BG;
	
		const gesCasesSymbol = stack.addText('📈 ');
		gesCasesSymbol.font = Font.mediumSystemFont(11);
		stack.addSpacer(1);
	
		// number of new cases
	
		let newActiveCases = data.areaNewCases - data.areaNewHealthy - data.areaNewDeaths;
		if (newActiveCases > 0) {
			const newActiveCasesLabel = stack.addText(formatCases(newActiveCases));
			newActiveCasesLabel.font = Font.mediumSystemFont(11);
			newActiveCasesLabel.textColor = COLOR_INFECTED;
		}
		else if (newActiveCases < 0) {
			const newActiveCasesLabel = stack.addText(formatCases(Math.abs(newActiveCases)));
			newActiveCasesLabel.font = Font.mediumSystemFont(11);
			newActiveCasesLabel.textColor = COLOR_HEALTHY;
		}
		else if (newActiveCases == 0) {
			const newActiveCasesLabel = stack.addText('±0');
			newActiveCasesLabel.font = Font.mediumSystemFont(11);
			newActiveCasesLabel.textColor = COLOR_FG;
		}
	
		// delimiter between number of new cases and total number of cases

		const gesCasesDelimiter = stack.addText(DELIMITER);
		gesCasesDelimiter.font = Font.mediumSystemFont(11);
		gesCasesDelimiter.textColor = COLOR_FG;
	
		// total number of cases
	
		let activeCases = data.areaCases - data.areaHealthy - data.areaDeaths;
		if (activeCases > 0) {
			const activeCasesLabel = stack.addText(formatCases(activeCases));
			activeCasesLabel.font = Font.mediumSystemFont(11);
			activeCasesLabel.textColor = COLOR_INFECTED;
		}
		else if (activeCases < 0) {
			const activeCasesLabel = stack.addText(formatCases(Math.abs(activeCases)));
			activeCasesLabel.font = Font.mediumSystemFont(11);
			activeCasesLabel.textColor = COLOR_HEALTHY;
		}
		else if (activeCases == 0) {
			const activeCasesLabel = stack.addText('±0');
			activeCasesLabel.font = Font.mediumSystemFont(11);
			activeCasesLabel.textColor = COLOR_FG;
		}
	 
		stack.addSpacer();

		return;
	}

	else if (row === '🏥') {
		stack.backgroundColor = COLOR_BG;
	
		let activeCases = data.areaCases - data.areaHealthy - data.areaDeaths;

		const hospitalLabelSymbol = stack.addText('🏥 ');
		hospitalLabelSymbol.font = Font.mediumSystemFont(11);
		stack.addSpacer(1);
		const hospitalLabel = stack.addText(formatCases(data.covidHospital) + DELIMITER + formatCases((data.covidHospital / activeCases * 100).toFixed(1)) + ' %');
		hospitalLabel.font = Font.mediumSystemFont(11);
		hospitalLabel.textColor = COLOR_FG;
		
		stack.addSpacer();

		return;
	}

	 	else if (row === '🫁') {
			stack.backgroundColor = COLOR_BG;
	
		let activeCases = data.areaCases - data.areaHealthy - data.areaDeaths;

		const ventLabelSymbol = stack.addText('🫁 ');
		ventLabelSymbol.font = Font.mediumSystemFont(11);
		stack.addSpacer(1);

		const ventLabel = stack.addText(formatCases(data.covidVentilated) + DELIMITER + formatCases((data.covidVentilated / activeCases * 100).toFixed(1)) + ' %');
		ventLabel.font = Font.mediumSystemFont(11);
		ventLabel.textColor = COLOR_FG;

		stack.addSpacer();

		return;
	}

	else if (row === '🛌') {
		stack.backgroundColor = COLOR_BG;

		const bedsSymbol = stack.addText('🛌 ');
		bedsSymbol.font = Font.mediumSystemFont(11);
		stack.addSpacer(1);
		const beds = stack.addText(formatCases(data.bedsFree) + DELIMITER + formatCases((data.bedsFree / data.bedsAll * 100).toFixed(1)) + ' %');
		beds.font = Font.mediumSystemFont(11);
		beds.textColor = COLOR_FG;

		stack.addSpacer();

		return;
	}

	else if (row === '➖') {
		stack.addSpacer();

		return;
	}
	
	else if (row === '📍') {
		stack.backgroundColor = COLOR_BG;
	
		 const symbol = stack.addText('📍 ');
		symbol.font = Font.mediumSystemFont(11);
		stack.addSpacer(1);

		const label = stack.addText(data.areaName);
		label.font = Font.regularSystemFont(11);
		label.textColor = COLOR_FG;

		stack.addSpacer();
	
		return;
	}

	else if (row === '🕰') {
		let dateRKI = `${data.updated.substr(0, 10)}`;
	
		let dateVaccinationAPI = new Date(vaccinated.lastUpdate);
		let dateVaccinationAPIdate = dateVaccinationAPI.getDate();
		if (dateVaccinationAPIdate < 10) {
			dateVaccinationAPIdate = '0' + dateVaccinationAPIdate;
		}
		let dateVaccinationAPImonth = dateVaccinationAPI.getMonth() + 1;
		if (dateVaccinationAPImonth < 10) {
			dateVaccinationAPImonth = '0' + dateVaccinationAPImonth;
		}
		let dateVaccinationAPIyear = dateVaccinationAPI.getFullYear();
		let dateVaccinationAPIformatted = dateVaccinationAPIdate + '.' + dateVaccinationAPImonth + '.' + dateVaccinationAPIyear;

		let updateLabelText = dateRKI;
		if (ROWS.includes('🧬')) {
			updateLabelText = updateLabelText + ' / 🧬 ' + dateVaccinationAPIformatted;
		}
		const updateLabel = stack.addText(updateLabelText);
		updateLabel.font = Font.systemFont(9);

		stack.addSpacer();
	
		return;
	}

}

function createUpdatedLabel(label, data) {
	let dateRKI = `${data.updated.substr(0, 10)}`;
	
	let dateVaccinationAPI = new Date(vaccinated.lastUpdate);
	let dateVaccinationAPIdate = dateVaccinationAPI.getDate();
	if (dateVaccinationAPIdate < 10) {
		dateVaccinationAPIdate = '0' + dateVaccinationAPIdate;
	}
	let dateVaccinationAPImonth = dateVaccinationAPI.getMonth() + 1;
	if (dateVaccinationAPImonth < 10) {
		dateVaccinationAPImonth = '0' + dateVaccinationAPImonth;
	}
	let dateVaccinationAPIyear = dateVaccinationAPI.getFullYear();
	let dateVaccinationAPIformatted = dateVaccinationAPIdate + '.' + dateVaccinationAPImonth + '.' + dateVaccinationAPIyear;

	let updateLabelText = dateRKI;
	if (MEDIUMWIDGET && ROWS.includes('🧬')) {
		updateLabelText = updateLabelText + ' / 🧬 ' + dateVaccinationAPIformatted;
	}
	const updateLabel = label.addText(updateLabelText);
	updateLabel.font = Font.systemFont(9);
	
	label.setPadding(2, 0, 2, 0);
}

/***************************************************************************
 * 
 * Helper functions
 * 
***************************************************************************/

function getFormatedDateBeforeDays(offset) {
	let today = new Date();
	let offsetDate = new Date();
	offsetDate.setDate(today.getDate() - offset);

	let offsetTime = offsetDate.toISOString().split('T')[0];
	return (offsetTime);
}

function getCasesByDates(jsonData, StartDate, EndDate) {
	let cases = 0;
	for (i = 0; i < jsonData.features.length; i++) {
		let date = new Date(jsonData.features[i].attributes[datumType]);
		date = date.toISOString().split('T')[0];
		if (StartDate <= date && date <= EndDate) {
			cases = cases + parseInt(jsonData.features[i].attributes.value);
		}
	}
	return cases
}

function getIncidenceLastWeek(jsonData, EWZ) {
	let incidence = [];
	let factor = EWZ / 100000;
	for (let i = 0; i < INCIDENCE_DAYS; i++) {
		startDate = (showIncidenceYesterday) ? getFormatedDateBeforeDays(INCIDENCE_DAYS + 7 - i) : getFormatedDateBeforeDays(INCIDENCE_DAYS + 6 - i);
		endDate = (showIncidenceYesterday) ? getFormatedDateBeforeDays(INCIDENCE_DAYS - i) : getFormatedDateBeforeDays(INCIDENCE_DAYS - 1 - i);
		incidence.push((getCasesByDates(jsonData, startDate, endDate) / factor).toFixed(1));
	}
	return incidence;
}

function getAreaName(attr) {
	if (individualName == '') {
		return (attr.GEN);
	} else {
		return (individualName);
	}
}

function getValueFromJson(data) {
	if (data.features[0].attributes.value != null) {
		return (parseInt(data.features[0].attributes.value));
	} else {
		return 0;
	}
}

function estimateReproductionFactor(pastIncidence, offset) {
	let l = pastIncidence.length - offset;
	let f = pastIncidence[l - 1] / pastIncidence[l - 8];

	return (Math.pow(f, 0.5));
}


function parseLocation(input) {
	const _coords = [];
	const _fixedCoordinates = input.split(";").map(coords => {
		return coords.split(',');
	})

	_fixedCoordinates.forEach(coords => {
		_coords[0] = {
			latitude: parseFloat(coords[1]),
			longitude: parseFloat(coords[2]),
		}
	})

	return _coords;
}

async function getData(useFixedCoordsIndex = false) {
	try {
		const location = await getLocation(useFixedCoordsIndex);
		let data = await new Request(apiUrl(location)).loadJSON();
		const attr = data.features[0].attributes;

		let bundeslandId = parseInt(attr.BL_ID);
		let landkreisId = parseInt(attr.RS);
		let landkreisApi = '';
		let diviApiLoc = '';
		let ewz = EWZ_GER;

		if (getState) {
			landkreisApi = `+AND+IdBundesland=${bundeslandId}`;
			diviApiLoc = `BL_ID=${bundeslandId}`;
			ewz = parseInt(attr.EWZ_BL);
		} else if (!getGermany) {
			landkreisApi = `+AND+IdLandkreis=${landkreisId}`;
			diviApiLoc = `AGS%20%3D%20'${attr.RS}'`;
			ewz = parseInt(attr.EWZ);
		}

		data = await new Request(apiUrlCasesLastDays(landkreisApi, getFormatedDateBeforeDays(GET_DAYS))).loadJSON();
		const areaCasesLastWeek = getCasesByDates(data, getFormatedDateBeforeDays(7), getFormatedDateBeforeDays(0));
		const areaCasesLastWeekYesterday = getCasesByDates(data, getFormatedDateBeforeDays(8), getFormatedDateBeforeDays(1));
		const areaCasesWeekBeforeWeek = getCasesByDates(data, getFormatedDateBeforeDays(13), getFormatedDateBeforeDays(6));
		const areaIncidenceLastWeek = getIncidenceLastWeek(data, ewz);
		let r_today = 0;
		let r_yesterday = 0;

		r_today = estimateReproductionFactor(areaIncidenceLastWeek, 1).toFixed(2);
		r_yesterday = estimateReproductionFactor(areaIncidenceLastWeek, 2).toFixed(2);

		data = await new Request(apiUrlCases(GESAMTFAELLE, landkreisApi)).loadJSON();
		const areaCases = getValueFromJson(data);
		data = await new Request(apiUrlCases(NEUE_FAELLE, landkreisApi)).loadJSON();
		const areaNewCases = getValueFromJson(data);

		data = await new Request(apiUrlCases(GESAMT_GESUND, landkreisApi)).loadJSON();
		const areaHealthy = getValueFromJson(data);
		data = await new Request(apiUrlCases(NEU_GESUND, landkreisApi)).loadJSON();
		const areaNewHealthy = getValueFromJson(data);

		data = await new Request(apiUrlCases(GESAMT_TODESFAELLE, landkreisApi)).loadJSON();
		const areaDeaths = getValueFromJson(data);
		data = await new Request(apiUrlCases(NEUE_TODESFAELLE, landkreisApi)).loadJSON();
		const areaNewDeaths = getValueFromJson(data);

		data = await new Request(apiUrlDivi(diviApiLoc)).loadJSON();

		const covidHospital = parseInt(data.features[0].attributes.faelle_covid_aktuell);
		const covidVentilated = parseInt(data.features[0].attributes.faelle_covid_aktuell_beatmet);
		const bedsFree = parseInt(data.features[0].attributes.betten_frei);
		const bedsAll = parseInt(data.features[0].attributes.betten_gesamt);

		let locIncidence = 0;
		if (getGermany) {
			locIncidence = parseFloat(areaIncidenceLastWeek[areaIncidenceLastWeek.length - 1]).toFixed(1);
		} else if (getState) {
			locIncidence = parseFloat(attr.cases7_bl_per_100k.toFixed(1));
		} else {
			locIncidence = parseFloat(attr.cases7_per_100k.toFixed(1));
		}

		const res = {
			landkreisId: landkreisId,
			bundeslandId: bundeslandId,
			incidence: locIncidence,
			areaName: getAreaName(attr),
			areaCases: areaCases,
			areaNewCases: areaNewCases,
			areaHealthy: areaHealthy,
			areaNewHealthy: areaNewHealthy,
			areaDeaths: areaDeaths,
			areaNewDeaths: areaNewDeaths,
			areaCasesLastWeek: areaCasesLastWeek,
			areaCasesLastWeekYesterday: areaCasesLastWeekYesterday,
			areaCasesWeekBeforeWeek: areaCasesWeekBeforeWeek,
			areaIncidenceLastWeek: areaIncidenceLastWeek,
			nameBL: STATES_SHORT[attr.BL],
			stateVaccinationAPI: STATES_VACCINATION_API[attr.BL],
			shouldCache: true,
			updated: attr.last_update,
			r_factor_today: r_today,
			r_factor_yesterday: r_yesterday,
			covidHospital: covidHospital,
			covidVentilated: covidVentilated,
			bedsFree: bedsFree,
			bedsAll: bedsAll,
		};
		return res;
	} catch (e) {
		console.log(e);
		return null;
	}
}

function getAreaName(attr) {
	if (individualName == '') {
		if (getGermany) {
			return ('Deutschland');
		} else if (getState) {
			return (attr.BL);
		} else {
			return (attr.GEN);
		}
	} else {
		return (individualName);
	}
}

async function getLocation(fixedCoordinateIndex = false) {
	try {
		if (fixedCoordinates && typeof fixedCoordinates[0] !== 'undefined') {
			return fixedCoordinates[0];
		} else {
			Location.setAccuracyToThreeKilometers();
			return await Location.current();
		}
	} catch (e) {
		return null;
	}
}

function getTrendArrow(preValue, currentValue) {
	let arrow = '';
	let pct = (parseFloat(currentValue) / parseFloat(preValue) - 1) * 100;
	if (pct < PCT_TREND_EQUAL && pct > -PCT_TREND_EQUAL) {
		arrow = '→';
	} else if (pct < PCT_TREND_INCREASE) {
		arrow = '↗';
	} else if (pct >= PCT_TREND_INCREASE) {
		arrow = '↑';
	} else if (pct > -PCT_TREND_INCREASE) {
		arrow = '↘';
	} else {
		arrow = '↓';
	}

	return (arrow);
}

function getTrendArrowFactor(rValue) {
	let arrow = '';
	let pct = (rValue - 1) * 100;

	if (pct < PCT_TREND_EQUAL && pct > -PCT_TREND_EQUAL) {
		arrow = '→';
	} else if (pct < PCT_TREND_INCREASE && pct >= PCT_TREND_EQUAL) {
		arrow = '↗';
	} else if (pct >= PCT_TREND_INCREASE) {
		arrow = '↑';
	} else if (pct > -PCT_TREND_INCREASE) {
		arrow = '↘';
	} else {
		arrow = '↓';
	}

	return (arrow);
}

function getTrendColor(arrow) {
	let color = COLOR_HEALTHY;
	
	if (arrow === '↑') {
		color = TIER_4_COLOR;
	} else if (arrow === '↗') {
		color = TIER_3_COLOR;
	} else if (arrow === '→') {
		color = TIER_3_COLOR;
	} else if (arrow === '↘') {
		color = TIER_3_COLOR;
	}
	
	return color;
}

function getRTrend(today, yesterday) {
	let trend = '→';
	
	if (today > yesterday) {
		trend = '↗';
	} else if (today < yesterday) {
		trend = '↘';
	}
	
	return trend;
}

function createGraph(row, data) {
	let graphHeight = 40;
	let graphLength = 140;
	let graphRow = row.addStack();
	graphRow.centerAlignContent();
	graphRow.useDefaultPadding();
	graphRow.size = new Size(graphLength, graphHeight);

	let incidenceColumnData = [];

	for (i = 0; i < data.areaIncidenceLastWeek.length; i++) {
		incidenceColumnData.push(data.areaIncidenceLastWeek[i]);
	}

	let image = columnGraph(incidenceColumnData, graphLength, graphHeight).getImage();
	let img = graphRow.addImage(image);
	img.resizable = false;
	img.centerAlignImage();
}

function columnGraph(data, width, height) {
	let context = new DrawContext();
	context.respectScreenScale = true;
	context.size = new Size(width, height);
	context.opaque = false;
	let max = Math.max(...data);
	data.forEach((value, index) => {
		context.setFillColor(getIncidenceColor(value));

		let w = (width / data.length) - 2;
		let h = value / max * height;
		let x = (w + 2) * index;
		let y = height - h;
		let rect = new Rect(x, y, w, h);
		context.fillRect(rect);
	});
	return context;
}

function getIncidenceColor(incidence) {
	let color = TIER_1_COLOR;
	
	if (incidence >= TIER_7_LIMIT) {
		color = TIER_7_COLOR;
	}
	else if (incidence >= TIER_6_LIMIT) {
		color = TIER_6_COLOR;
	} 
	else if (incidence >= TIER_5_LIMIT) {
		color = TIER_5_COLOR;
	} 
	else if (incidence >= TIER_4_LIMIT) {
		color = TIER_4_COLOR;
	}
	else if (incidence >= TIER_3_LIMIT) {
		color = TIER_3_COLOR;
	} 
	else if (incidence >= TIER_2_LIMIT) {
		color = TIER_2_COLOR;
	} 
	
	return color;
}

function formatCases(cases) {
	return formatedCases = getRoundedNumber(cases).toLocaleString('de-DE');
}

function getRoundedNumber(num) {
	let roundedNumber = num;

	if (Math.abs(Number(num)) >= 1.0e+6) {
		roundedNumber = Math.round(parseFloat(num / 1.0e+6)*100)/100 + " M";
		}
		else if (Math.abs(Number(num)) >= 1.0e+5) {
				roundedNumber = Math.round(parseFloat(num / 1.0e+3)) + " K";
		}
		else if (Math.abs(Number(num)) >= 1.0e+3) {
				roundedNumber = Math.round(parseFloat(num / 1.0e+3)*10)/10 + " K";
		}
	
	return roundedNumber;
}

async function getVaccinationData() {
	// Set up the file manager.
	const files = FileManager.local()

	// Set up cache
	const cachePath = files.joinPath(files.cacheDirectory(), "api-cache-covid-vaccine-numbers")
	const cacheExists = files.fileExists(cachePath)
	const cacheDate = cacheExists ? files.modificationDate(cachePath) : 0

	// Get Data
	try {
		// If cache exists and it's been less than 30 minutes since last request, use cached data.
		if (cacheExists && (today.getTime() - cacheDate.getTime()) < (30 * 60 * 1000)) {
			vaccinated = JSON.parse(files.readString(cachePath))
		} else {
			const request = new Request('https://rki-vaccination-data.vercel.app/api')
			vaccinated = await request.loadJSON()
			try {
				files.writeString(cachePath, JSON.stringify(vaccinated))
			} catch (e) {
				console.log("Creating Cache failed!")
				console.log(e)
			}
		}
	} catch (e) {
		console.error(e)
		if (cacheExists) {
			vaccinated = JSON.parse(files.readString(cachePath))
		} else {
			console.log("No fallback to cache possible. Due to missing cache.")
		}
	}
}
