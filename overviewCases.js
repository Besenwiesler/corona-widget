// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-brown; icon-glyph: magic;
// LICENCE: Robert Koch-Institut (RKI), dl-de/by-2-0
// Basic Idea and Code Snippets 
//      FROM AUTHOR: kevinkub https://gist.github.com/kevinkub/46caebfebc7e26be63403a7f0587f664
//      AND FROM AUTHOR: rphl https://gist.github.com/rphl/0491c5f9cb345bf831248732374c4ef5
// Author: tzschies https://gist.github.com/tzschies/be551cc6939e7c1469c2e8407edab517

/**
 * Set Widgetparameter: AREA,LAT,LONG,NAME
 *
 * Examples:
 *
 * Show fix district (Landkreis): 0,51.1244,6.7353
 * Show fix state (Bundesland): 1,51.1244,6.7353 (inser some coordinates of a city of the state)
 * Show Germany: 2
 * Show local district (Landkreis): 0 (OR EMPTY)
 * Show local state (Bundesland): 1
 * 
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
// set to false for white background in dark mode
// set to true for gray background in dark mode
const ENABLE_SMOOTH_DARK_MODE = false;

const backgroundColor = new Color('f0f0f0');
const colorCases = new Color('fe0000 ');
const colorHealthy = new Color('008800');
const colorDeahts = new Color('202020');

/* alternative colors if smooth dark mode is enabled */
const altBackgroundColor = new Color('252525');
const altColorCases = new Color('fe0000');
const altColorHealthy = new Color('00aa00');
const altColorDeaths = new Color('f0f0f0');

const LIMIT_DARKRED = 100;
const LIMIT_RED = 50;
const LIMIT_ORANGE = 35;
const LIMIT_YELLOW = 25;
const LIMIT_DARKRED_COLOR = new Color('9e000a');
const LIMIT_RED_COLOR = new Color('f6000f');
const LIMIT_ORANGE_COLOR = new Color('#ff7927');
const LIMIT_YELLOW_COLOR = new Color('F5D800');
const LIMIT_GREEN_COLOR = new Color('1CC747');

const MAX_CHARACHTERS_BIG_HEADER = 14;
const fontSizeBigHeader = 14;
const fontSizeSmallHeader = 12;

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
 * Lets's Start ...
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

let data = {};
const widget = await createWidget();
if (!config.runsInWidget) {
    await widget.presentMedium();
}
Script.setWidget(widget);
Script.complete();

async function createWidget() {
    const data = await getData(0);
    const list = new ListWidget();
    list.setPadding(10, 10, 10, 10);
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
            stack.addSpacer(10);
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

            const header = main.addStack()
            header.useDefaultPadding();
            header.centerAlignContent();
            header.layoutHorizontally();
            header.size = new Size(120, 34);
            createHeader(header, data);
            header.addSpacer()

            createCasesBlock(main, data);
            main.addSpacer(10);
            createUpdatedLabel(main, data);

        }
    } else {
        list.addSpacer();
        createWaitMsg(list);
        list.refreshAfterDate = new Date(Date.now() + 1 * 15 * 1000); // Reload in 15 Sekunden
    }

    return list;
}


function createLeftSide(list, data) {
    const headerWidth = 120;

    const headerLabel = list.addStack();
    headerLabel.useDefaultPadding();
    headerLabel.centerAlignContent();
    headerLabel.layoutHorizontally();
    headerLabel.size = new Size(headerWidth, 34);

    createHeader(headerLabel, data);

    list.addSpacer(1);

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

    list.addSpacer(5);
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

function createWaitMsg(stack) {
    const errorLabel = stack.addText("Daten nicht verfügbar. \nReload erfolgt... \nBitte warten.");
    errorLabel.font = Font.mediumSystemFont(12);
    errorLabel.textColor = Color.gray();
}

function createWaitLocationMsg(stack) {
    const loadingIndicator = stack.addText("Ort wird ermittelt...".toUpperCase());
    loadingIndicator.font = Font.mediumSystemFont(13);
    loadingIndicator.textOpacity = 0.5;

}

function createHeader(stack, data) {
    const header = stack.addText("");
    header.font = Font.mediumSystemFont(12);
    const areanameLabel = stack.addText(data.areaName);
    areanameLabel.font = Font.mediumSystemFont(14);
    areanameLabel.lineLimit = 2;
}

function createCasesBlock(stack, data) {
    let smoothDark = (Device.isUsingDarkAppearance() && ENABLE_SMOOTH_DARK_MODE);
    let bgColor = smoothDark ? altBackgroundColor : backgroundColor;
    let cColor = smoothDark ? altColorCases : colorCases;
    let hColor = smoothDark ? altColorHealthy : colorHealthy;
    let dColor = smoothDark ? altColorDeaths : colorDeahts;
    let space = 1;

    // Active Cases 
    const gesCasesStack = stack.addStack();
    gesCasesStack.setPadding(2, 5, 2, 2);
//     gesCasesStack.size = new Size(130, 14);
    
    gesCasesStack.centerAlignContent();
    gesCasesStack.backgroundColor = bgColor;
    gesCasesStack.cornerRadius = 6;
    gesCasesStack.size = new Size(130, 18);
    

    let activeCases = data.areaCases - data.areaHealthy - data.areaDeaths;
    const areaGesActiveLabel = gesCasesStack.addText('📈 ' + formatCases(activeCases));
    areaGesActiveLabel.font = Font.mediumSystemFont(11);
    areaGesActiveLabel.lineLimit = 1;
    areaGesActiveLabel.textColor = Color.black();
    gesCasesStack.addSpacer();

    stack.addSpacer(space);

    // Cases Overview
    const casesStack = stack.addStack();
    casesStack.setPadding(2, 5, 2, 2);
    casesStack.centerAlignContent();
    casesStack.backgroundColor = bgColor;
    casesStack.cornerRadius = 6;
    casesStack.size = new Size(130, 18);

    const casesLabelSymbol = casesStack.addText('🦠 ');
    casesLabelSymbol.font = Font.mediumSystemFont(11);
    casesLabelSymbol.textColor = cColor;
    casesStack.addSpacer(1);
    const casesLabelNew = casesStack.addText(formatCases(data.areaNewCases) + ' ');
    casesLabelNew.font = Font.mediumSystemFont(11);
    casesLabelNew.textColor = cColor;
    const casesLabelGesamt = casesStack.addText('(' + formatCases(data.areaCases) + ')');
    casesLabelGesamt.font = Font.mediumSystemFont(11);
    casesLabelGesamt.textColor = cColor;
    casesStack.addSpacer();

    stack.addSpacer(space);

    // Healthy Overview
    const healthyStack = stack.addStack();
    healthyStack.setPadding(2, 5, 2, 2);
    healthyStack.centerAlignContent();
    healthyStack.backgroundColor = bgColor;
    healthyStack.cornerRadius = 6;
    healthyStack.size = new Size(130, 18);

    const healthyLabelSymbol = healthyStack.addText('💚 ');
    healthyLabelSymbol.font = Font.mediumSystemFont(11);
    healthyLabelSymbol.textColor = hColor;
    healthyStack.addSpacer(1);
    const healthyLabelNew = healthyStack.addText(formatCases(data.areaNewHealthy) + ' ');
    healthyLabelNew.font = Font.mediumSystemFont(11);
    healthyLabelNew.textColor = hColor;
    const healthyLabelGesamt = healthyStack.addText('(' + formatCases(data.areaHealthy) + ')');
    healthyLabelGesamt.font = Font.mediumSystemFont(11);
    healthyLabelGesamt.textColor = hColor;
    healthyStack.addSpacer();

    stack.addSpacer(space);

    // Deaths Overview
    const deathsStack = stack.addStack();
    deathsStack.setPadding(2, 5, 2, 2);
    deathsStack.centerAlignContent();
    deathsStack.backgroundColor = bgColor;
    deathsStack.cornerRadius = 6;
    deathsStack.size = new Size(130, 18);

    const deathsLabelSymbol = deathsStack.addText('🪦 ');
    deathsLabelSymbol.font = Font.mediumSystemFont(11);
    deathsLabelSymbol.textColor = dColor;
    deathsStack.addSpacer(1);
    const deathsLabelNew = deathsStack.addText(formatCases(data.areaNewDeaths) + ' ');
    deathsLabelNew.font = Font.mediumSystemFont(11);
    deathsLabelNew.textColor = dColor;
    const deathsLabelGesamt = deathsStack.addText('(' + formatCases(data.areaDeaths) + ')');
    deathsLabelGesamt.font = Font.mediumSystemFont(11);
    deathsLabelGesamt.textColor = dColor;
    deathsStack.addSpacer();
}

function createHospitalBlock(stack, data) {
    let smoothDark = (Device.isUsingDarkAppearance() && ENABLE_SMOOTH_DARK_MODE);
    let bgColor = smoothDark ? altBackgroundColor : backgroundColor;
    let cColor = smoothDark ? altColorCases : colorCases;
    let hColor = smoothDark ? altColorHealthy : colorHealthy;
    let dColor = smoothDark ? altColorDeaths : colorDeahts;
    let space = 1;

    let activeCases = data.areaCases - data.areaHealthy - data.areaDeaths;

    stack.addSpacer(space)

    // Hospital Overview
    const hospitalStack = stack.addStack();
    hospitalStack.setPadding(2, 5, 2, 2);
    hospitalStack.centerAlignContent();
    hospitalStack.backgroundColor = bgColor;
    hospitalStack.cornerRadius = 6;
    hospitalStack.size = new Size(130, 18);

    const hospitalLabelSymbol = hospitalStack.addText('🏥 ');
    hospitalLabelSymbol.font = Font.mediumSystemFont(11);
    hospitalLabelSymbol.textColor = dColor;
    hospitalStack.addSpacer(1);
    const hospitalLabelTxt = hospitalStack.addText(formatCases(data.covidHospital) + ' ');
    hospitalLabelTxt.font = Font.mediumSystemFont(11);
    hospitalLabelTxt.textColor = dColor;
    const hospitalLabelRel = hospitalStack.addText('(' + formatCases((data.covidHospital / activeCases * 100).toFixed(1)) + '%)');
    hospitalLabelRel.font = Font.mediumSystemFont(11);
    hospitalLabelRel.textColor = dColor;
    hospitalStack.addSpacer();

    stack.addSpacer(space);

    // Ventilated Overview
    const ventStack = stack.addStack();
    ventStack.setPadding(2, 5, 2, 2);
    ventStack.centerAlignContent();
    ventStack.backgroundColor = bgColor;
    ventStack.cornerRadius = 6;
    ventStack.size = new Size(130, 18);

    const ventLabelSymbol = ventStack.addText('🫁 ');
    ventLabelSymbol.font = Font.mediumSystemFont(11);
    ventLabelSymbol.textColor = dColor;
    ventStack.addSpacer(1);
    const ventLabelTxt = ventStack.addText(formatCases(data.covidVentilated) + ' ');
    ventLabelTxt.font = Font.mediumSystemFont(11);
    ventLabelTxt.textColor = dColor;
    const ventLabelRel = ventStack.addText('(' + formatCases((data.covidVentilated / activeCases * 100).toFixed(1)) + '%)');
    ventLabelRel.font = Font.mediumSystemFont(11);
    ventLabelRel.textColor = dColor;
    ventStack.addSpacer();

    stack.addSpacer(space);

    // Ventilated Overview
    const bedsStack = stack.addStack();
    bedsStack.setPadding(2, 5, 2, 2);
    bedsStack.centerAlignContent();
    bedsStack.backgroundColor = bgColor;
    bedsStack.cornerRadius = 6;
    bedsStack.size = new Size(130, 18);

    const bedsSymbol = bedsStack.addText('🛌 ');
    bedsSymbol.font = Font.mediumSystemFont(11);
    bedsSymbol.textColor = dColor;
    bedsStack.addSpacer(1);
    const bedsTxt = bedsStack.addText(formatCases(data.bedsFree) + ' ');
    bedsTxt.font = Font.mediumSystemFont(11);
    bedsTxt.textColor = dColor;
    const bedsRelTxt = bedsStack.addText('(' + formatCases((data.bedsFree / data.bedsAll * 100).toFixed(1)) + '%)');
    bedsRelTxt.font = Font.mediumSystemFont(11);
    bedsRelTxt.textColor = dColor;
    bedsStack.addSpacer();
}

function createIncidenceBlock(stack, data) {
    let areaIncidence = (showIncidenceYesterday) ? data.areaIncidenceLastWeek[data.areaIncidenceLastWeek.length - 1] : data.incidence;
    let incidence = areaIncidence >= 100 ? Math.round(areaIncidence) : parseFloat(areaIncidence).toFixed(1);
    const incidenceLabel = stack.addText(incidence.toLocaleString());
    incidenceLabel.font = Font.boldSystemFont(25);
    incidenceLabel.textColor = getIncidenceColor(incidence);
}

function createIncTrendBlock(stack, data) {
    let length = data.areaIncidenceLastWeek.length;

    const incidenceTrend = getTrendArrowFactor(parseFloat(data.r_factor_today).toFixed(3));
    const incidenceLabelTrend = stack.addText('' + incidenceTrend);
    incidenceLabelTrend.font = Font.mediumSystemFont(20);
    incidenceLabelTrend.rightAlignText();
    incidenceLabelTrend.textColor = getTrendColor(incidenceTrend);
}

function createRFactorBlock(stack, data, fontsize) {
    let smoothDark = (Device.isUsingDarkAppearance() && ENABLE_SMOOTH_DARK_MODE);
    let bgColor = smoothDark ? altBackgroundColor : backgroundColor;
    let dColor = smoothDark ? altColorDeaths : colorDeahts;

    stack.setPadding(2, 2, 2, 2);
    stack.centerAlignContent();
    stack.backgroundColor = bgColor;
    stack.cornerRadius = 6;

    const rLabel = stack.addText('R: ' + data.r_factor_today + ' ' + getRTrend(data.r_factor_today, data.r_factor_yesterday));
    rLabel.font = Font.mediumSystemFont(fontsize);
    rLabel.textColor = dColor;
}

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
    } else {
        color = LIMIT_GREEN_COLOR;
    }
    return (color);
}

function createUpdatedLabel(label, data) {
    const updateLabel = label.addText(`${data.updated.substr(0, 10)} `);
    updateLabel.font = Font.systemFont(9);
    updateLabel.textColor = Color.black();
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
    if (incidence >= LIMIT_DARKRED) {
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
	return formatedCases = getRoundedNumber(cases).toLocaleString('de-DE');
}

function getRoundedNumber(num) {
	let roundedNumber = num;

	if (Math.abs(Number(num)) >= 1.0e+6) {
		roundedNumber = Math.round(parseFloat(num / 1.0e+6)*10)/10 + " M";
    	}
    	else if (Math.abs(Number(num)) >= 1.0e+5) {
      		roundedNumber = Math.round(parseFloat(num / 1.0e+3)) + " K";
    	}
    	else if (Math.abs(Number(num)) >= 1.0e+3) {
      		roundedNumber = Math.round(parseFloat(num / 1.0e+3)*10)/10 + " K";
    	}
    
	return roundedNumber;
}
