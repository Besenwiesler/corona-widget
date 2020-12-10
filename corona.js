// LICENCE: Robert Koch-Institut (RKI), dl-de/by-2-0

// URL of GitHub repository: https://github.com/Besenwiesler/incidence
// Fork of https://github.com/tzschies/incidence with minor adjustments only


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
// you can change the determination of the trend
// set to 1: the trend is positive, if the incidence of yesterday is higher than the week before
// set to 0: the trend is positive, if the incidence of today is higher than the week before
const trendDaysOffset = 1;

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

const COLOR_BG = new Color('f0f0f0');
const COLOR_FG = Color.black();
const COLOR_INFECTED = new Color('fe0000');
const COLOR_HEALTHY = new Color('008800');

const LIMIT_DARKDARKRED = 250;
const LIMIT_DARKRED = 100;
const LIMIT_RED = 50;
const LIMIT_ORANGE = 35;
const LIMIT_YELLOW = 25;
const LIMIT_DARKDARKRED_COLOR = new Color('941100');
const LIMIT_DARKRED_COLOR = new Color('c01a00');
const LIMIT_RED_COLOR = new Color('f92206');
const LIMIT_ORANGE_COLOR = new Color('faa31b');
const LIMIT_YELLOW_COLOR = new Color('f7dd31');
const LIMIT_GREEN_COLOR = new Color('00cc00');

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
const apiRUrl = `https://www.rki.de/DE/Content/InfAZ/N/Neuartiges_Coronavirus/Projekte_RKI/Nowcasting_Zahlen_csv.csv?__blob=publicationFile`;

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

const BUNDESLAENDER_SHORT = {
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

const PCT_TREND_EQUAL = 5;
const PCT_TREND_INCREASE = 10;

let getGermany = false;
let getState = false;
let fixedCoordinates = [];
let individualName = '';

let MEDIUMWIDGET = (config.widgetFamily === 'medium') ? true : false;

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
    if (parameters.length == 4) {
        individualName = parameters[3].slice();
    }
} else {}

if (!config.runsInWidget) {
  MEDIUMWIDGET = true;
}

let data = {};
const widget = await createWidget();
if (!config.runsInWidget) {
  await widget.presentMedium();
}
Script.setWidget(widget);
Script.complete();

/***************************************************************************
 * 
 * Functions to display widget content
 * 
***************************************************************************/

function createWaitMsg(stack) {
    const errorLabel = stack.addText("Corona-Widget\n\nDaten derzeit nicht verfügbar.");
    errorLabel.font = Font.mediumSystemFont(12);
}

function createWaitLocationMsg(stack) {
    const loadingIndicator = stack.addText("Corona-Widget\n\nOrt wird ermittelt...");
    loadingIndicator.font = Font.mediumSystemFont(12);
}

async function createWidget() {
    const data = await getData(0);
    const list = new ListWidget();
    list.setPadding(10, 5, 10, 5);
    const stack = list.addStack();
    stack.layoutHorizontally();

    if (data && typeof data !== 'undefined') {
        if (!data.shouldCache) {
            list.addSpacer(2);
            createWaitLocationMsg(list);
        } else {
            list.refreshAfterDate = new Date(Date.now() + 6 * 60 * 60 * 1000);
        }

        if (MEDIUMWIDGET) {
            const left = stack.addStack();
            left.size = new Size(130, 130);
            left.layoutVertically();

            createLeftSide(left, data);
            stack.addSpacer(20);
            const right = stack.addStack();
            right.size = new Size(130, 130);
            right.layoutVertically();
            createRightSide(right, data);
        } else {
            const main = stack.addStack();
            main.size = new Size(130, 130);
            main.layoutVertically();
            main.useDefaultPadding();
            main.centerAlignContent();
            
            createLeftSide(main, data);
        }
    } else {
        list.addSpacer();
        createWaitMsg(list);
        list.refreshAfterDate = new Date(Date.now() + 1 * 15 * 1000); // Reload in 15 Sekunden
    }

    return list;
}

function createLeftSide(list, data) {
    const headerWidth = 130;

    const headerLabel = list.addStack();
    headerLabel.useDefaultPadding();
    headerLabel.centerAlignContent();
    headerLabel.layoutHorizontally();
    headerLabel.size = new Size(headerWidth, 20);

    createHeader(headerLabel, data);

    list.addSpacer(5);
    
    const middle = list.addStack();
    middle.layoutHorizontally();
    middle.centerAlignContent();
    middle.size = new Size(headerWidth, 28);
    const incStack = middle.addStack();
    const trendStack = middle.addStack();
    createIncidenceBlock(incStack, data);
    createIncTrendBlock(trendStack, data);

    // R-Faktor
    
    list.addSpacer(2);
    const bottom = list.addStack();
    bottom.layoutHorizontally();
    bottom.centerAlignContent();
    bottom.size = new Size(headerWidth, 12);
    const rfactorStack = bottom.addStack();
    rfactorStack.layoutHorizontally();
    rfactorStack.centerAlignContent();
    rfactorStack.size = new Size(headerWidth / 2, 12);
    createRFactorBlock(rfactorStack, data, 10);

    list.addSpacer(15);
    createGraph(list, data);

    list.addSpacer(2);
    const datestack = list.addStack();
    datestack.layoutHorizontally();
    datestack.centerAlignContent();
    createUpdatedLabel(datestack, data);
}

function createRightSide(list, data) {
    const right = list.addStack();
    right.layoutVertically();
    right.centerAlignContent();
    createCasesBlock(right, data);
    createHospitalBlock(right, data);
}

function createHeader(stack, data) {
    const areanameLabel = stack.addText(data.areaName);
    areanameLabel.font = Font.boldSystemFont(15);
    areanameLabel.lineLimit = 1;
}

function createCasesBlock(stack, data) {
  
    // Infected / Cases
    
    const casesStack = stack.addStack();
    casesStack.setPadding(2, 5, 2, 2);
    casesStack.centerAlignContent();
    casesStack.backgroundColor = COLOR_BG;
    casesStack.cornerRadius = 6;
    casesStack.size = new Size(130, 18);

    const casesLabelSymbol = casesStack.addText('🔴 ');
    casesLabelSymbol.font = Font.mediumSystemFont(11);
    casesStack.addSpacer(1);
    
    const casesNewLabel = casesStack.addText(formatCases(data.areaNewCases));
    casesNewLabel.font = Font.mediumSystemFont(11);
    casesNewLabel.textColor = COLOR_INFECTED;
    
    const casesDelimiterLabel = casesStack.addText(DELIMITER);
    casesDelimiterLabel.font = Font.mediumSystemFont(11);
    casesDelimiterLabel.textColor = COLOR_FG;
    
    const casesSumLabel = casesStack.addText(formatCases(data.areaCases));
    casesSumLabel.font = Font.mediumSystemFont(11);
    casesSumLabel.textColor = COLOR_INFECTED;
    
    casesStack.addSpacer();

    stack.addSpacer(1);

    // Healthy
    
    const healthyStack = stack.addStack();
    healthyStack.setPadding(2, 5, 2, 2);
    healthyStack.centerAlignContent();
    healthyStack.backgroundColor = COLOR_BG;
    healthyStack.cornerRadius = 6;
    healthyStack.size = new Size(130, 18);

    const healthyLabelSymbol = healthyStack.addText('🟢 ');
    healthyLabelSymbol.font = Font.mediumSystemFont(11);
    healthyStack.addSpacer(1);
    
    const healthyNewLabel = healthyStack.addText(formatCases(data.areaNewHealthy));
    healthyNewLabel.font = Font.mediumSystemFont(11);
    healthyNewLabel.textColor = COLOR_HEALTHY;
    
    const healthyDelimiterLabel = healthyStack.addText(DELIMITER);
    healthyDelimiterLabel.font = Font.mediumSystemFont(11);
    healthyDelimiterLabel.textColor = COLOR_FG;
    
    const healthySumLabel = healthyStack.addText(formatCases(data.areaHealthy));
    healthySumLabel.font = Font.mediumSystemFont(11);
    healthySumLabel.textColor = COLOR_HEALTHY;
    
    healthyStack.addSpacer();

    stack.addSpacer(1);

    // Deaths
    
    const deathsStack = stack.addStack();
    deathsStack.setPadding(2, 5, 2, 2);
    deathsStack.centerAlignContent();
    deathsStack.backgroundColor = COLOR_BG;
    deathsStack.cornerRadius = 6;
    deathsStack.size = new Size(130, 18);

    const deathsLabelSymbol = deathsStack.addText('🪦 ');
    deathsLabelSymbol.font = Font.mediumSystemFont(11);
    deathsStack.addSpacer(1);
    const deathsLabel = deathsStack.addText(formatCases(data.areaNewDeaths) + DELIMITER + formatCases(data.areaDeaths));
    deathsLabel.font = Font.mediumSystemFont(11);
    deathsLabel.textColor = COLOR_FG;
    deathsStack.addSpacer();
    
    stack.addSpacer(1);
    
    // Active Cases
    
    const gesCasesStack = stack.addStack();
    gesCasesStack.setPadding(2, 5, 2, 2);
    
    gesCasesStack.centerAlignContent();
    gesCasesStack.backgroundColor = COLOR_BG;
    gesCasesStack.cornerRadius = 6;
    gesCasesStack.size = new Size(130, 18);
    
    const gesCasesSymbol = gesCasesStack.addText('📈 ');
    gesCasesSymbol.font = Font.mediumSystemFont(11);
    gesCasesStack.addSpacer(1);
    
    // number of new cases
    
    let newActiveCases = Math.abs(data.areaNewCases) - Math.abs(data.areaNewHealthy) - Math.abs(data.areaNewDeaths);
    if (newActiveCases > 0) {
        const newActiveCasesLabel = gesCasesStack.addText(formatCases(newActiveCases));
        newActiveCasesLabel.font = Font.mediumSystemFont(11);
        newActiveCasesLabel.textColor = COLOR_INFECTED;
    }
    else if (newActiveCases < 0) {
        const newActiveCasesLabel = gesCasesStack.addText(formatCases(Math.abs(newActiveCases)));
        newActiveCasesLabel.font = Font.mediumSystemFont(11);
        newActiveCasesLabel.textColor = COLOR_HEALTHY;
    }
    else if (newActiveCases == 0) {
        const newActiveCasesLabel = gesCasesStack.addText('±0');
        newActiveCasesLabel.font = Font.mediumSystemFont(11);
        newActiveCasesLabel.textColor = COLOR_FG;
    }
    
    // delimiter between number of new cases and total number of cases
    
    const gesCasesDelimiter = gesCasesStack.addText(DELIMITER);
    gesCasesDelimiter.font = Font.mediumSystemFont(11);
    gesCasesDelimiter.textColor = COLOR_FG;
    
    // total number of cases
    
    let activeCases = Math.abs(data.areaCases) - Math.abs(data.areaHealthy) - Math.abs(data.areaDeaths);
    if (activeCases > 0) {
        const activeCasesLabel = gesCasesStack.addText(formatCases(activeCases));
        activeCasesLabel.font = Font.mediumSystemFont(11);
        activeCasesLabel.textColor = COLOR_INFECTED;
    }
    else if (activeCases < 0) {
        const activeCasesLabel = gesCasesStack.addText(formatCases(Math.abs(activeCases)));
        activeCasesLabel.font = Font.mediumSystemFont(11);
        activeCasesLabel.textColor = COLOR_HEALTHY;
    }
    else if (activeCases == 0) {
        const activeCasesLabel = gesCasesStack.addText('±0');
        activeCasesLabel.font = Font.mediumSystemFont(11);
        activeCasesLabel.textColor = COLOR_FG;
    }
   
    gesCasesStack.addSpacer();
}

function createHospitalBlock(stack, data) {
    let activeCases = data.areaCases - data.areaHealthy - data.areaDeaths;

    stack.addSpacer(1);

    // Hospital
    
    const hospitalStack = stack.addStack();
    hospitalStack.setPadding(2, 5, 2, 2);
    hospitalStack.centerAlignContent();
    hospitalStack.backgroundColor = COLOR_BG;
    hospitalStack.cornerRadius = 6;
    hospitalStack.size = new Size(130, 18);

    const hospitalLabelSymbol = hospitalStack.addText('🏥 ');
    hospitalLabelSymbol.font = Font.mediumSystemFont(11);
    hospitalStack.addSpacer(1);
    const hospitalLabel = hospitalStack.addText(formatCases(data.covidHospital) + DELIMITER + formatCases((data.covidHospital / activeCases * 100).toFixed(1)) + '%');
    hospitalLabel.font = Font.mediumSystemFont(11);
    hospitalLabel.textColor = COLOR_FG;
    hospitalStack.addSpacer();

    stack.addSpacer(1);

    // Ventilated
    
    const ventStack = stack.addStack();
    ventStack.setPadding(2, 5, 2, 2);
    ventStack.centerAlignContent();
    ventStack.backgroundColor = COLOR_BG;
    ventStack.cornerRadius = 6;
    ventStack.size = new Size(130, 18);

    const ventLabelSymbol = ventStack.addText('🫁 ');
    ventLabelSymbol.font = Font.mediumSystemFont(11);
    ventStack.addSpacer(1);
    const ventLabel = ventStack.addText(formatCases(data.covidVentilated) + DELIMITER + formatCases((data.covidVentilated / activeCases * 100).toFixed(1)) + '%');
    ventLabel.font = Font.mediumSystemFont(11);
    ventLabel.textColor = COLOR_FG;
    ventStack.addSpacer();

    stack.addSpacer(1);

    // Free beds
    
    const bedsStack = stack.addStack();
    bedsStack.setPadding(2, 5, 2, 2);
    bedsStack.centerAlignContent();
    bedsStack.backgroundColor = COLOR_BG;
    bedsStack.cornerRadius = 6;
    bedsStack.size = new Size(130, 18);

    const bedsSymbol = bedsStack.addText('🛌 ');
    bedsSymbol.font = Font.mediumSystemFont(11);
    bedsStack.addSpacer(1);
    const beds = bedsStack.addText(formatCases(data.bedsFree) + DELIMITER + formatCases((data.bedsFree / data.bedsAll * 100).toFixed(1)) + '%');
    beds.font = Font.mediumSystemFont(11);
    beds.textColor = COLOR_FG;
    bedsStack.addSpacer();
}

function createIncidenceBlock(stack, data) {
    let areaIncidence = (showIncidenceYesterday) ? data.areaIncidenceLastWeek[data.areaIncidenceLastWeek.length - 1] : data.incidence;
    let incidence = Math.round(areaIncidence);
    const incidenceLabel = stack.addText(incidence.toLocaleString());
    incidenceLabel.font = Font.boldSystemFont(25);
    incidenceLabel.textColor = getIncidenceColor(incidence);
}

function createIncTrendBlock(stack, data) {
    let length = data.areaIncidenceLastWeek.length;

    const incidenceTrend = getTrendArrowFactor(parseFloat(data.r_factor_today).toFixed(3));
    const incidenceLabelTrend = stack.addText('' + incidenceTrend);
    incidenceLabelTrend.font = Font.boldSystemFont(25);
    incidenceLabelTrend.rightAlignText();
    incidenceLabelTrend.textColor = getTrendColor(incidenceTrend);
}

function createRFactorBlock(stack, data, fontsize) {
    stack.setPadding(2, 2, 2, 2);
    stack.centerAlignContent();
    stack.backgroundColor = COLOR_BG;
    stack.cornerRadius = 6;

    const rLabel = stack.addText('R: ' + data.r_factor_today + ' ' + getRTrend(data.r_factor_today, data.r_factor_yesterday));
    rLabel.font = Font.mediumSystemFont(fontsize);
    rLabel.textColor = COLOR_FG;
}

function createUpdatedLabel(label, data) {
    const updateLabel = label.addText(`${data.updated.substr(0, 10)} `);
    updateLabel.font = Font.systemFont(9);
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
            nameBL: BUNDESLAENDER_SHORT[attr.BL],
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
    let color;
    if (arrow === '↑') {
        color = LIMIT_DARKRED_COLOR;
    } else if (arrow === '↗') {
        color = LIMIT_RED_COLOR;
    } else if (arrow === '→') {
        color = LIMIT_ORANGE_COLOR;
    } else if (arrow === '↘') {
        color = LIMIT_YELLOW_COLOR;
    } else {
        color = LIMIT_GREEN_COLOR;
    }
    return (color);
}

function getRTrend(today, yesterday) {
    let trend = '→';
    if (today > yesterday) {
        trend = '↗';
    } else if (today < yesterday) {
        trend = '↘';
    }
    return (trend);
}

function createGraph(row, data) {
    let graphHeight = 40;
    let graphLength = 130;
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
    let color = LIMIT_GREEN_COLOR;
    
    if (incidence >= LIMIT_DARKDARKRED) {
        color = LIMIT_DARKDARKRED_COLOR;
    } else if (incidence >= LIMIT_DARKRED) {
        color = LIMIT_DARKRED_COLOR;
    } else if (incidence >= LIMIT_RED) {
        color = LIMIT_RED_COLOR;
    } else if (incidence >= LIMIT_ORANGE) {
        color = LIMIT_ORANGE_COLOR;
    } else if (incidence >= LIMIT_YELLOW) {
        color = LIMIT_YELLOW_COLOR;
    }
    
    return color;
}

function formatCases(cases) {
	return formatedCases = getRoundedNumber(Math.abs(cases)).toLocaleString('de-DE');
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
