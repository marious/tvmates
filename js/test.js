String.prototype.hashCode = function() {
    if (Array.prototype.reduce) {
        return this.split("").reduce(function(a, b) {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
    }
    var hash = 0;
    if (this.length === 0)
        return hash;
    for (var i = 0; i < this.length; i++) {
        var character = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + character;
        hash = hash & hash;
        // Convert to 32bit integer
    }
    var hashString = new String(hash);
    return hashString.replace(/[^A-z0-9]/, "");
};


var AIVALIDATOR = {
    //   http://stackoverflow.com/questions/9386971/adding-jquery-validator-rules-to-dynamically-created-elements
    rules : new Array(),
    formValidator : null,

    addRule: function( myobject, validator ) {
        if(typeof validator != "undefined") {
            validator.qs = myobject;
            this.rules.push(validator);
        }
    },

    applyRules: function( myobject ) {
        $( myobject ).removeData('validator');
        AIVALIDATOR.formValidator = $( myobject ).validate({
            debug: true,
            ignoreTitle: true,
            errorElement: 'div',
            onkeyup: function(element, event) {
                error_id = "error_field_" + $(element).attr("name");
                if ($("#"+error_id).is(":visible") && AIVALIDATOR.formValidator.element(element)) {
                    AD.clearError(".error", error_id);
                    $(element).removeClass("inputError");
                } else {
                    //Code for show a valid message or remove a invalid message
                    // console.log("invalido");
                }
            },
            onclick: function( element, event ) {
                if(element.tagName == "SELECT") {
                    if(!$(element).data("tovalidate")) {
                        $(element).change(function() {
                            AIVALIDATOR.checkIsValid(element, event);
                        });
                    }
                    $(element).data("tovalidate", true);
                    return;
                }
                AIVALIDATOR.checkIsValid(element, event);
            },
            /*onfocusout: function(e) {
             //AIVALIDATOR.formValidator.element(e);
             },*/
            submitHandler: function( form ) {
                $(".error").hide();
                $(".inputError").first().focus();
            },
            showErrors: function(errorMap, errorList) {
                $.each(errorMap, function(fieldname, message) {
                    AD.showError("aiform", "error", "error_field_", fieldname, message);
                });
                //this.defaultShowErrors();
            }
        });

        $.each(AIVALIDATOR.rules, function(index, validator) {
            var jsrules = AIVALIDATOR.getFieldRules(validator);
            for (indx in jsrules) {
                try {
                    $( '*[name="'+validator.qs+'"]' ).rules( "add", jsrules[indx] );
                } catch(err) {
                    //console.log(err);
                }
            }
        });
        AIVALIDATOR.rules = new Array();
    },

    getFieldRules: function ( validator ) {
        var jsrule = [];
        var validators_check = "";
        $.each(validator, function (index) {
            var multiple = (this.type == validators_check) ? true : false;
            try {
                jsrule.push(AIVALIDATOR.convertRule(this, multiple, validator));
            } catch(err) {
                //console.log(err);
            }
            validators_check = this.type;
        });

        return jsrule;
    },

    getDefaultRule: function (val_name, rule_spec, rule_msg) {
        var myObj = new Object;
        myObj[val_name] = rule_spec;
        myObj["messages"] = new Object;
        myObj["messages"][val_name] = rule_msg;
        return myObj;
    },

    convertRule: function ( rule, multiple, validator ) {
        rule.msg = rule.msg || "Campo non valido";
        switch( rule.type ) {
            case 'MIN':
                return {
                    minlength: parseInt(rule.spec),
                    messages: {
                        minlength: rule.msg
                    }
                };

            case 'MAX':
                return {
                    maxlength: parseInt(rule.spec),
                    messages: {
                        maxlength: rule.msg
                    }
                };

            case 'REQUIRED':
                return {
                    required: ($( '*[name="'+validator.qs+'"]' ).prop("required") ? true : false),
                    messages: {
                        required: rule.msg
                    }
                };

            case 'REGEX':
                var valName = (multiple) ? "regex" + new String(rule.spec).hashCode() : "regex";
                $.validator.addMethod(
                    valName,
                    function(value, element, myregexp) {
                        var re = new RegExp(myregexp);
                        return this.optional(element) || re.test(value);
                    },
                    rule.msg
                );

                return AIVALIDATOR.getDefaultRule(valName, rule.spec, rule.msg);

            case 'RANGEMAX':
                var valName = (multiple) ? "rangemax" + new String(rule.spec).hashCode() : "rangemax";
                $.validator.addMethod(
                    valName,
                    function(value, element, maxnum) {
                        var field_name = $(element).attr("name");
                        return (this.optional(element) || ($("*[name='"+field_name+"']:checked").length <= maxnum));
                    },
                    rule.msg
                );

                return AIVALIDATOR.getDefaultRule(valName, rule.spec, rule.msg);

            case 'EQUAL_TO':
                var valName = (multiple) ? "equalto" + new String(rule.spec).hashCode() : "equalto";
                $.validator.addMethod(
                    valName,
                    function(value, element, check_element) {
                        return (this.optional(element) || ($("*[name='"+check_element+"']").val() == value));
                    },
                    rule.msg
                );

                return AIVALIDATOR.getDefaultRule(valName, rule.spec, rule.msg);

            default:
                return {};
        }
    },

    checkIsValid : function ( element, event ) {
        var field_name = $(element).attr("name");
        var error_id = "error_field_" + field_name;
        var field_is_valid = AIVALIDATOR.formValidator.element(element);

        if ($("#"+error_id).is(":visible") && field_is_valid) {
            AD.clearError(".error", error_id);
            $(element).removeClass("inputError");
        } else if(!field_is_valid) {
            // AIVALIDATOR.rules[field_name]
            $.each( AIVALIDATOR.formValidator.errorMap, function(field, error){
                if(field == field_name)
                    AD.showError("aiform", "error", "error_field_", field_name, error);
            });
        }
    }

};

///////////////////////////////////////////////////////////////////////////////
//
//  jsErrLog.js         version 1.3
//
//  Trap javascript errors on a webpage and re-direct them to a remote logging service
//  which can then be used to identify and resolve issues without impacting user experience
//
//  v1.3: add support for jsErrLog.qsignore parameter
//  v1.2: add support for jsErrLog.url parameter
//  v1.1: add support for jsErrLog.info parameter
//  v1.0: Original
///////////////////////////////////////////////////////////////////////////////

if (!window.jsErrLog)
    window.jsErrLog = { };

// default to debug logging true
jsErrLog.logEnabled = (typeof jsErrLog.logEnabled !== "undefined") ? jsErrLog.logEnabled : true;
// default to debugging off: writes error also with console.log
jsErrLog.debugMode = (typeof jsErrLog.debugMode !== "undefined") ? jsErrLog.debugMode : false;
// default error message to blank
jsErrLog.error_msg = (typeof jsErrLog.error_msg !== "undefined") ? jsErrLog.error_msg : "";
// default the index for the message to 0 in case there is more than one
jsErrLog.err_i = (typeof jsErrLog.err_i !== "undefined") ? jsErrLog.err_i : 0;
// default the additional info message to blank
jsErrLog.info = (typeof jsErrLog.info !== "undefined") ? jsErrLog.info : "";
// set it to null to disable logging with AJAX request
jsErrLog.ajax_log = (typeof jsErrLog.ajax_log !== "undefined") ? jsErrLog.ajax_log : "/jse";
// default the URL to the appspot service
jsErrLog.url = (typeof jsErrLog.url !== "undefined") ? jsErrLog.url : "/img/blank.gif";
// default the qsIgnore to nothing (ie pass everything on the querystring)
jsErrLog.qsIgnore = (typeof jsErrLog.qsIgnore !== "undefined") ? jsErrLog.qsIgnore : new Array();
//default file log name
jsErrLog.log_name = (typeof jsErrLog.log_name !== "undefined") ? jsErrLog.log_name : 'NEWAD_JS_ERRORS';



// used internally for testing to know if test succeeded or not
jsErrLog._had_errors = false;

// add the hook to the onError event
// - first store any existing error handler for the page
jsErrLog.fnPreviousOnErrorHandler = window.onerror;
// - attach our error handler

if(jsErrLog.logEnabled) {
    window.onerror=function(msg, file_loc, line_no){
        if(!jsErrLog._had_errors) {
            jsErrLog._had_errors = true;
            jsErrLog.ErrorTrap(msg, file_loc, line_no);
            if(typeof(jsErrLog.fnPreviousOnErrorHandler) == "function") {
                // process any existing onerror handler
                jsErrLog.fnPreviousOnErrorHandler(msg, file_loc, line_no);
            }
        }
        return true;
    };
};
jsErrLog.appendScript = function(index, src) {
    try {
        //var script = document.createElement("script");
        var script = document.createElement("img");
        script.id = "jserr" + index;
        script.src = src;
        //script.type = "text/javascript";

        var body = document.getElementsByTagName("body")[0];
        body.appendChild(script);
    }
    catch (e) {
        jsErrLog.ErrorHandler("appendScript", e);
    }
};

jsErrLog.removeScript = function(index) {
    try {
        var script = document.getElementById("jserr" + index);
        var body = document.getElementsByTagName("body")[0];
        body.removeChild(script);
    }
    catch (e) {
        jsErrLog.ErrorHandler("removeScript", e);
    }
};

jsErrLog.ErrorHandler = function(source, error) {
    jsErrLog._had_errors = true;
    console.log("jsErrLog encountered an unexpected error.\n\nSource: " + source + "\nDescription: " + error.description);
};

jsErrLog.guid = function() { // http://www.ietf.org/rfc/rfc4122.txt section 4.4
    return 'aaaaaaaa-aaaa-4aaa-baaa-aaaaaaaaaaaa'.replace(/[ab]/g, function(ch) {
        var digit = Math.random()*16|0, newch = ch == 'a' ? digit : (digit&0x3|0x8);
        return newch.toString(16);
    }).toUpperCase();
};

// Needed to break the URL up if we want to ignore parameters
jsErrLog.parseURL = function(url)
{
    // save the unmodified url to "href" property so
    // the returned object matches the built-in location object
    var locn = { 'href' : url };

    // split the URL components
    var urlParts = url.replace('//', '/').split('/');

    //store the protocol and host
    locn.protocol = urlParts[0];
    locn.host = urlParts[1];

    //extract port number from the host
    urlParts[1] = urlParts[1].split(':');
    locn.hostname = urlParts[1][0];
    locn.port = urlParts[1].length > 1 ? urlParts[1][1] : '';

    //splice and join the remainder to get the pathname
    urlParts.splice(0, 2);
    locn.pathname = '/' + urlParts.join('/');

    //extract hash
    locn.pathname = locn.pathname.split('#');
    locn.hash = locn.pathname.length > 1 ? '#' + locn.pathname[1] : '';
    locn.pathname = locn.pathname[0];

    // extract search query
    locn.pathname = locn.pathname.split('?');
    locn.search = locn.pathname.length > 1 ? '?' + locn.pathname[1] : '';
    locn.pathname = locn.pathname[0];

    return locn;
};

// Respond to an error being raised in the javascript
jsErrLog.ErrorTrap = function(msg, file_loc, line_no) {
    // Is we are debugging on the page then display the error details
    if(jsErrLog.debugMode) {
        jsErrLog.error_msg = "Error found in page: " + file_loc +
            "\nat line number:" + line_no +
            "\nError Message:" + msg;
        if (jsErrLog.info != "") {
            jsErrLog.error_msg += "\nInformation:" + jsErrLog.info;
        }
        try {
            console.error("jsErrLog caught an error\n--------------\n" + jsErrLog.error_msg);
        } catch(err) {}
        jsErrLog._had_errors = false;
    }

    jsErrLog.err_i = jsErrLog.err_i + 1;

    // if there are parameters we need to ignore on the querystring strip them off
    var sn = document.URL;
    if (jsErrLog.qsIgnore.length > 0) {
        var objURL = new Object();
        // make sure the qsIgnore array is lower case
        for (var i in jsErrLog.qsIgnore) {
            jsErrLog.qsIgnore[i] = jsErrLog.qsIgnore[i].toLowerCase();
        }

        // Use the String::replace method to iterate over each
        // name-value pair in the query string.
        window.location.search.replace(
            new RegExp( "([^?=&]+)(=([^&]*))?", "g" ),
            // For each matched query string pair, add that
            // pair to the URL struct using the pre-equals
            // value as the key.
            function( $0, $1, $2, $3 ){
                // Only if the key is NOT in the ignore list should we pick it up
                if (jsErrLog.qsIgnore.indexOf($1.toLowerCase()) == -1) {
                    objURL[ $1 ] = $3;
                }
            }
        );
        var newSearch = "";
        for (var strKey in objURL){
            newSearch += newSearch == ("") ? "?" + strKey + "=" + objURL[strKey] : "&" + strKey + "=" + objURL[strKey];
        };

        // Rebuild the new "sn" parameter containing the sanitized version of the querystring
        sn = window.location.protocol + window.location.host + window.location.pathname;
        sn += window.location.search != ("") ? newSearch : "";
        sn += window.location.hash != ("") ? window.location.hash : "";

        // now repeat the process for the fileloc
        var fl = jsErrLog.parseURL(file_loc);
        objURL = new Object();
        fl.search.replace(
            new RegExp( "([^?=&]+)(=([^&]*))?", "g" ),
            // For each matched query string pair, add that
            // pair to the URL struct using the pre-equals
            // value as the key.
            function( $0, $1, $2, $3 ){
                // Only if the key is NOT in the ignore list should we pick it up
                if (jsErrLog.qsIgnore.indexOf($1.toLowerCase()) == -1) {
                    objURL[ $1 ] = $3;
                }
            }
        );
        var newFL = "";
        for (var strKey in objURL){
            newFL += newFL == ("") ? "?" + strKey + "=" + objURL[strKey] : "&" + strKey + "=" + objURL[strKey];
        };
        if (newFL != "") {
            file_loc = fl.protocol + fl.host + fl.pathname;
            file_loc += fl.search != ("") ? newFL : "";
            file_loc += fl.hash != ("") ? fl.hash : "";

        }
    }

    if(jsErrLog.ajax_log !== null) {
        jQuery.post(jsErrLog.ajax_log, {
            i: jsErrLog.err_i,
            sn: sn,
            fl: file_loc,
            ln: line_no,
            err: msg,
            ui: jsErrLog.guid(),
            log_name: jsErrLog.log_name
        }).always(function()  {
            jsErrLog._had_errors = false;
        });
    } else {
        // format the data for the request
        var src = jsErrLog.url + "?i=" + jsErrLog.err_i;
        src += "&sn=" + escape(sn);
        src += "&fl=" + file_loc;
        src += "&ln=" + line_no;
        src += "&err=" + msg.substr(0, 1024);
        src += "&ui=" + jsErrLog.guid();
        if (jsErrLog.info != "") {
            src += "&info=" + escape(jsErrLog.info.substr(0, 512));
        }

        // and pass the error details to the Async logging sender
        jsErrLog.appendScript(jsErrLog.err_i, src);
        jsErrLog._had_errors = false;
    }

    return true;
};
function phone_verification_link() {
    var url = "/pf";
    popupInfo(url, 780, 600,"scrollbars");
    return false;
};

function popupInfo(url, width, height, scrollbars) {
    w = width ? width : 600;
    h = height ? height : 400;
    x = (screen.width - w) / 2;
    y = (screen.height - h) / 2;
    window.open(url, "popup", "width=" + w + ",height=" + h + ",left=" + x + ",top=" + y + ",scrollbars=" + (scrollbars ? "yes" : "no") + ",menubar=no,status=no,location=no,resizable=no");
};

function StringToPrice(sNumber) {
    myRtNumb = Number(sNumber.substr(0, sNumber.length - 2));
    mySmcNumb = Number(sNumber.substr(-2)) / 100;
    nTot = myRtNumb + mySmcNumb;
    return nTot;
};
function PriceToFullStringPrice(sNumber) {
    nVal = StringToPrice(sNumber);
    sVal = "";
    if (!isNaN(nVal) && nVal.toString().indexOf('.') == -1) {
        sVal = nVal.toString() + ",00";
    } else {
        sVal = nVal.toString();
    };
    return sVal;
};
function parse_url(url, part) {
    var pattern = RegExp("^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?");
    var matches = url.match(pattern);
    if (part && typeof (part) == 'number' && Number(part) === part) {
        return matches[part];
    };
    return {
        scheme : matches[2],
        authority : matches[4],
        path : matches[5],
        query : matches[7],
        fragment : matches[9]
    };
};
function createOverlayShadow() {
    try {
        $('<div id="temp_overlay_shadow" class="temp_shadow"></div>').prependTo('body');
    } catch (e) {
    };
}
function removeOverlayShadow() {
    try {
        $('#temp_overlay_shadow').remove();
    } catch (e) {
    };
}

function popOverInitOverlay() {
    if ($('.overlay').length) {
        $('.overlay').dialog({
            modal : true,
            autoOpen : false,
            resizable : false,
            width : is_mobile ? "auto" : 750,
            dialogClass : 'no-close',
            open : function(event, ui) {
                createOverlayShadow();
            },
            close : function(event, ui) {
                removeOverlayShadow();
            }
        });
    };
};
function popOverInitButton() {
    $('.x_pop_close').click(function() {
        $(".overlay").dialog("close");
    });
    $('.popover_link').click(function(e) {
        e.preventDefault();
        popOverInitOverlay();
        var id = "#" + parse_url(this.href, 9);
        if ($(id).hasClass('o_small')) {
            $(id).dialog("option", "width", 365);
        }
        $(id).dialog("open");
    });
};
function include_script(src, callback) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    if (callback) {
        script.onload = callback;
        script.onreadystatechange = function() {
            if (this.readyState == "complete" || this.readyState == "loaded") {
                this.onload();
                this.onload = this.onreadystatechange = null;
            }
        };
    }
    document.getElementsByTagName("head")[0].appendChild(script);
}

function initMap() {
    if (AD.values.latitude && AD.values.longitude) {
        setMapOnCoord(AD.values.latitude, AD.values.longitude, 16);
    }
}

base_url_pics = jsonConfiguration.picsBaseURLs;

var mapInitialized = false;
var geocoder;
var pin_map;
var pinIcon = base_url_pics + "/img2/mapquest-pin.png";
var map;
var tip = "Scrivi qui l'indirizzo e clicca su 'Trova'";
var DEFAULT_ZOOM = 16;
var dragListener;

function mapInitialize() {
    mapCanvas = document.getElementById("map_canvas");
    $(mapCanvas).show();
    map = new google.maps.Map(mapCanvas, {
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        scrollwheel: false,
        smallZoomControl: true
    });

    dragListener = google.maps.event.addListener(map, "dragend", function() {
        var formtag = document.forms.aiform;
        point = map.getCenter();
        formtag.latitude.value = point.lat();
        formtag.longitude.value = point.lng();
        showPin();
    });

    google.maps.event.addListener(map, "zoom_changed", function() {
        document.forms.aiform.zoom.value = map.getZoom();
    });

    mapInitialized = true;
}

function removeTownFromAddress(address, town) {
    address = address.toLowerCase();
    firstCityWord = town.split(' ')[0];
    firstCityWord = firstCityWord.replace(/^\s+|\s+$/, '');
    pos = address.indexOf(firstCityWord.toLowerCase());
    if (pos > -1) {
        tokens = address.substr(0, pos).split(' ');
        lastword = tokens[tokens.length - 2];
        if (lastword && lastword.match('/via|viale|piazza|corso|vicolo/') > -1)
            return address;
        else
            return address.substr(0, pos);
    } else
        return address;
}

function loadShopAddress(shop_latitude, shop_longitude, zoom) {
    mapCanvas = document.getElementById("map_canvas");
    $(mapCanvas).show();

    if (!mapInitialized) {
        mapInitialize();
    }
    point = new google.maps.LatLng(shop_latitude, shop_longitude);
    map.setCenter(point);
    removePin();

    pin_map = new google.maps.Marker({
        icon: pinIcon,
        position: point,
        clickable: false,
        draggable: false,
        animation: google.maps.Animation.DROP,
        map: map
    });

    google.maps.event.removeListener(dragListener);
}

function setMapOnCoord(nLat, nLong, nZoom) {
    mapCanvas = document.getElementById("map_canvas");
    $(mapCanvas).show();

    mapInitialize();
    point = new google.maps.LatLng(nLat, nLong);
    map.setZoom(nZoom);
    map.setCenter(point);
    removePin();

    pin_map = new google.maps.Marker({
        icon: pinIcon,
        position: point,
        clickable: false,
        draggable: true,
        animation: google.maps.Animation.DROP,
        map: map
    });
}

function geolocationCallback(response) {
    mapHelp = document.getElementById("map_help");
    mapCanvas = document.getElementById("map_canvas");

    if (!response) {
        mapHelp.innerHTML = "<div class=\"warningMap\">L'indirizzo non &egrave; stato trovato. Prova a specificarlo meglio inserendo anche il CAP, il comune e la provincia.</div><br />";
        $(mapHelp).show();
        $(mapCanvas).hide();
    } else {
        if (response.length == 1) {
            if (response[0].partial_match) {
                mapHelp.innerHTML = "<div class=\"errorMap\">Non &egrave; stato trovato l'indirizzo esatto. Verifica di averlo<br />scritto correttamente oppure sposta la puntina nella<br />posizione desiderata.</div><br class='sep'/>";
                $(mapHelp).show();
            } else {
                $(mapHelp).hide();
            }
            if (!mapInitialized) {
                mapInitialize();
            }

            point = response[0].geometry.location;
            document.forms.aiform.latitude.value = point.lat();
            document.forms.aiform.longitude.value = point.lng();
            document.forms.aiform.zoom.value = DEFAULT_ZOOM;

            $(mapCanvas).show();
            centerOnCoords();
            showPin();
            showInfoWindow();
        } else {
            var buildHTML = "<div><span class=\"warningMap\">Sono stati trovati pi&ugrave; risultati. Scegli l'indirizzo corretto dall'elenco oppure specificale meglio inserendo, ad esempio, il CAP, il comune e la provincia.</span><br /><ul>";
            $(mapCanvas).hide();
            $(mapHelp).show();
            for (i = 0; i < response.length; i++) {
                buildHTML += "<li class=\"list\" ><a href='#' onclick=\"document.getElementById('map_canvas').style.display='block';document.forms.aiform.longitude.value='" + response[i].geometry.location.lng() + "';document.forms.aiform.latitude.value='" + response[i].geometry.location.lat() + "';document.forms.aiform.zoom.value='" + DEFAULT_ZOOM + "';centerOnCoords();showPin();document.getElementById('map_help').style.display='none';return false;\">" + response[i].formatted_address + "</a></li>";
            }
            buildHTML += "</ul></div>";
            mapHelp.innerHTML = buildHTML;
        }
    }
}

function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function searchAddress(address) {
    sFullAddress = address;
    sCity = $("[name='town']").val();
    if (sCity != "") {
        sFullAddress += ", " + sCity;
    }
    if (!geocoder) {
        geocoder = new google.maps.Geocoder();
    }
    geocoder.geocode({"address": sFullAddress}, function(response) {
        geolocationCallback(response);
    });
}

function centerOnCoords(panning) {
    formtag = document.forms.aiform;
    if (!mapInitialized) {
        mapInitialize();
    }
    point = new google.maps.LatLng(formtag.latitude.value, formtag.longitude.value);
    if (panning) {
        map.setZoom(formtag.zoom.value ? parseInt(formtag.zoom.value) : DEFAULT_ZOOM);
        map.panTo(point);
    } else {
        map.setZoom(formtag.zoom.value ? parseInt(formtag.zoom.value) : DEFAULT_ZOOM);
        map.setCenter(point);
    }
}

function removePin() {
    if (pin_map) {
        pin_map.setMap(null);
    }
}

function showPin() {
    formtag = document.forms.aiform;
    removePin();

    pin_map = new google.maps.Marker({
        icon: pinIcon,
        position: new google.maps.LatLng(formtag.latitude.value, formtag.longitude.value),
        clickable: false,
        draggable: true,
        animation: google.maps.Animation.DROP,
        map: map
    });

    google.maps.event.addListener(pin_map, "dragstart", function() {
        if (pin_map.infowindow) {
            pin_map.infowindow.close();
        }
    });

    google.maps.event.addListener(pin_map, "dragend", function() {
        formtag = document.forms.aiform;
        point = pin_map.getPosition();
        formtag.latitude.value = point.lat();
        formtag.longitude.value = point.lng();
        centerOnCoords(true);
    });
}

function showInfoWindow() {
    var tipNode = document.createElement('div');
    tipNode.style.width = '200px';
    tipNode.style.height = '50px';
    tipNode.id = 'tip';
    tipNode.innerHTML = 'Se la posizione individuata non &egrave; corretta, puoi trascinare la puntina nella posizione desiderata.';
    pin_map.infowindow = new google.maps.InfoWindow({
        content: tipNode
    });
    pin_map.infowindow.open(map, pin_map);
}

function showHideMapForm() {
    formtag = document.forms.aiform;
    shop_map = document.getElementById("showmap_shop");

    if ((document.getElementById("showmap_yes").checked) || (shop_map && shop_map.checked)) {
        document.getElementById("inputmap").style.display = 'block';
        if (shop_map && shop_map.checked) {
            formtag.findonmap.disabled = true;
            formtag.address.disabled = true;
            $("#map_search_field").hide();
        } else {
            formtag.findonmap.disabled = false;
            formtag.address.disabled = false;
            $("#map_search_field").show();
        }
    } else {
        formtag.latitude.value = '';
        formtag.longitude.value = '';
        formtag.zoom.value = '';
        document.getElementById("map_canvas").style.display = 'none';
        document.getElementById("inputmap").style.display = 'none';
        document.getElementById("map_help").style.display = 'none';
        formtag.address.value = tip;
    }
}

/*
 * Cookie handling
 */
function setCookie(_name, _value, _days, _domain) {
    var expires = "";
    if (_days != null) {
        if (_days < 0) {
            _days = 3000; // permanent cookie
        }
        var date = new Date();
        date.setTime(date.getTime() + (_days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    }
    if (_value != null && _value != "") {
        var cookie_string = _name + "=" + _value + expires + "; path=/";
        if (typeof _domain != "undefined" && _domain != null && _domain != "" && _domain != false)
            cookie_string += "; domain=" + _domain;

        document.cookie = cookie_string;
        return true;
    }
    return false;
}

function getCookie(_name) {
    var cookieStr = document.cookie;
    var arr = cookieStr.split(";");

    for (var i = 0; i < arr.length; i++) {
        var cookieArr = arr[i].split("=");
        var cookieName = cookieArr[0].replace(" ", "");
        if (cookieName == _name) {
            return unescape(cookieArr[1]);
        }
    }

    return null;
}
var API = {

    jsonConfig: '',
    jsonResponse: '',

    arrayTowns: [],
    arrayCities: [],

    formFields: [],
    collectFields: [],

    utilSlug: function (toSlugify) {
        function stripVowelAccent(str) {
            var rExps = [{
                re: /[\xC0-\xC6]/g,
                ch: 'A'
            }, {
                re: /[\xE0-\xE6]/g,
                ch: 'a'
            }, {
                re: /[\xC8-\xCB]/g,
                ch: 'E'
            }, {
                re: /[\xE8-\xEB]/g,
                ch: 'e'
            }, {
                re: /[\xCC-\xCF]/g,
                ch: 'I'
            }, {
                re: /[\xEC-\xEF]/g,
                ch: 'i'
            }, {
                re: /[\xD2-\xD6]/g,
                ch: 'O'
            }, {
                re: /[\xF2-\xF6]/g,
                ch: 'o'
            }, {
                re: /[\xD9-\xDC]/g,
                ch: 'U'
            }, {
                re: /[\xF9-\xFC]/g,
                ch: 'u'
            }, {
                re: /[\xD1]/g,
                ch: 'N'
            }, {
                re: /[\xF1]/g,
                ch: 'n'
            }];

            for (var i = 0, len = rExps.length; i < len; i++)
                str = str.replace(rExps[i].re, rExps[i].ch);

            return str;
        }
        toSlugify = toSlugify.replace(/^\s+|\s+$/g, '');
        toSlugify = toSlugify.replace(/\s{0,}\(([A-z]+)\){0,}$/g, ',$1');
        toSlugify = toSlugify.replace(/\s{0,},\s{0,}/g, '|');

        toSlugify = toSlugify.toLowerCase();
        toSlugify = stripVowelAccent(toSlugify);

        toSlugify = toSlugify.replace(/[^a-z0-9 \-\'|]/g, '').replace(/\'/g, '-').replace(/\s+/g, '-').replace(/-+/g, '-');

        toSlugify = toSlugify.replace(/-$/, '');
        toSlugify = toSlugify.replace(/-\|/, '|');
        toSlugify = toSlugify.replace(/\|$/, '');

        return toSlugify;
    },

    init: function (jsonConfig, action, callback) {
        var apiUrl,
            getParams = {};

        this.jsonConfig = jsonConfig;

        switch(action) {
            case 'edit':
                apiUrl = this.jsonConfig.apiUrlLoad;
                getParams.id = currentId;
                break;
            default:
                apiUrl = this.jsonConfig.apiUrlInit;
        }

        getParams.ch = this.getChannelForm();

        this.getResponse(apiUrl, getParams, action, callback);
    },
    getResponse: function(url, params, action, callback) {
        var that = this;

        $.getJSON(url, params, function (response) {
            if (response.action !== action) {
                API.reset(function() {
                    that.getResponse(url, params, action, callback);
                });
            } else {
                callback(response);
            }
        });
    },
    reset: function (callback) {
        $.getJSON(this.jsonConfig.apiUrlReset, {
            ch: this.getChannelForm()
        }, function (response) {
            callback();
        });
    },
    deleteAllImages: function (callback) {

        $.post(this.jsonConfig.apiUrlRemoveAllImages, {}, function (response) {
            callback(response);
        });
    },
    getAutocompleteValuesForField: function (field) {
        'use strict';

        switch (field) {
            case 'town':
                return this.arrayTowns;
            case 'city':
                return this.arrayCities;
            default:
                return null;
        }
    },
    getOptionValuesForField: function (field) {

        switch (field.type) {
            case 'category':
                return this.jsonConfig.categories;
            case 'town':
                return this.jsonConfig.locations[0].towns;
            case 'city':
                return this.jsonConfig.locations[0].cities;
            default:
                params = {};
                list_name = field.value_list;
                if (field.url) {

                    requiredField = field.requires;
                    while (requiredField) {
                        requiredValue = AD.getField(requiredField);
                        list_name += "_" + requiredValue;
                        params[requiredField] = requiredValue;
                        parentField = this.getFieldByQs(requiredField);
                        requiredField = parentField ? parentField.requires : null;
                    };

                }

                list = this.jsonResponse.value_lists[list_name];
                if (!list && field.url) {
                    $.ajax({
                        url: '/'+field.url,
                        dataType: 'json',
                        async: false,
                        data: params,
                        success: function (data) {
                            API.jsonResponse.value_lists[list_name] = data;
                            list = data;
                        }
                    });
                }
                return list;
        }
    },
    setCitiesAndTowns: function (city, region) {
        'use strict';

        var idCity = Number(city),
            idRegion = Number(region);

        if (this.arrayTowns.length === 0) {
            $.each(this.jsonConfig.locations[0].towns, function () {
                if (idCity && idRegion && (idCity !== Number(this.parent_city) || idRegion !== Number(this.parent_region))) {
                    return;
                }
                API.arrayTowns.push(this.name);
            });
            API.arrayTowns.sort();
        }
        if (this.arrayCities.length === 0) {
            $.each(this.jsonConfig.locations[0].cities, function () {
                if (idRegion && idRegion !== Number(this.parent_region)) {
                    return;
                }
                API.arrayCities.push(this.name);
            });
            API.arrayCities.sort();
        }
    },
    concateFields: function () {
        if (this.collectFields.length > 0) {
            return this.collectFields;
        } else {
            $.each(this.formFields, function () {
                API.collectFields = API.collectFields.concat(this.fields);
            });
            return API.collectFields;
        }
    },
    getFieldByQs: function (qs) {
        var result = $.grep(this.concateFields(), function (item) {
            return (item.qs == qs);
        });
        if (result) {
            return result[0];
        }
        return null;
    },

    getDisplayValue: function (qs, value) {
        if (!qs || !value) {
            return '';
        }
        field = this.getFieldByQs(qs);
        if (field.type == 'text' || field.type == 'textarea' || field.type == "date") {
            if (field.format == 'password') {
                return '********';
            };
            return value;
        } else if (field.type == 'boolean' || field.type == 'tos') {
            return (parseInt(value) == 1 ? 'S&igrave;' : 'No');
        };
        list = this.getOptionValuesForField(field);
        if (list) {
            switch (field.type) {
                case 'category':
                    result = $.grep(list, function (item) {
                        return item['id'] == value;
                    });
                    if (result.length > 0 && result[0].name) {
                        return result[0].name;
                    }
                    break;
                case 'town':
                    result = list[value];
                    if (result) {
                        return list[value]['name'];
                    }
                    break;
                case 'city':
                    result = list[value];
                    if (result) {
                        return list[value]['name'];
                    }
                    break;
                default:
                    result = $.grep(list, function (item) {
                        if (item['id'] == value) {
                            return true;
                        };
                        return false;
                    });
                    if (result && result[0]) {
                        return result[0]['value'];
                    }
                    break;
            }
        }
        return '';
    },

    getFields: function (dataStored, callback) {
        var incrementStep = 0,
            fieldsToReturn = {},
            requiredFields = dataStored.getRequiredFields(),
            apiUrl = this.jsonConfig.apiUrlAiForm;

        if (typeof currentAction !== 'undefined' && currentAction === 'edit' && typeof currentId !== 'undefined') {
            requiredFields.action = 'edit';
        }

        $.getJSON(apiUrl, requiredFields, function (jsonReturned) {
            API.jsonResponse = jsonReturned;
            $.each(API.jsonResponse.steps, function () {
                fieldsToReturn[incrementStep] = {};
                fieldsToReturn[incrementStep]['fields'] = [];
                if (typeof (this.header) != 'undefined') {
                    fieldsToReturn[incrementStep]['header'] = this.header;
                }
                $.each(this.fields, function () {
                    if (typeof (this.value_list) != 'undefined') {
                        if (typeof (this.url) != 'undefined' || typeof (API.getOptionValuesForField(this)) != 'undefined') {
                            fieldsToReturn[incrementStep]['fields'].push(this);
                        }
                    } else {
                        fieldsToReturn[incrementStep]['fields'].push(this);
                    }
                });
                incrementStep++;
            });
            API.collectFields = [];
            API.formFields = fieldsToReturn;
            callback(fieldsToReturn);
        });
    },
    getCurrentFields: function () {

        return this.formFields;
    },
    getSelectValues: function (key, values, callback) {

        for (var value in values) {
            if (values.hasOwnProperty(value) && values[value] === '') {
                return false;
            }
        }
        var sApiUrl =  '/' + this.getFieldByQs(key).url;
        $.getJSON(sApiUrl, values, function (response) {
            callback(key,response);
        });
    },
    getPaidOptions: function (toAppend, callback) {

        var url = this.jsonConfig.apiUrlPaidOptions + '?ch=' + this.getChannelForm();
        $.getJSON(url, {}, function (response) {
            callback(toAppend, response);
        });
    },

    resetLocationDetails: function (dataStored) {

        dataStored.delField('town');
        dataStored.delField('city');
        dataStored.delField('region');
    },
    setLocationDetailsFromTown: function (locationName, dataStored, callback) {
        var matched = 0;
        var regExpTown = new RegExp('^([a-z\-]+)(\|\([a-z]+\))');
        var slug_locationName = this.utilSlug(locationName);
        var resultMatch = slug_locationName.match(regExpTown);

        this.resetLocationDetails(dataStored);
        var towns = this.jsonConfig.locations[0].towns;

        for (town in towns) {
            if (towns[town].key === slug_locationName) {
                matched = 1;
                dataStored.setField('town', town);
                dataStored.setField('city', towns[town].parent_city);
                dataStored.setField('region', towns[town].parent_region);
                var correctName = towns[town].name;
                break;
            } else {
                var keyTown = towns[town].key.match(regExpTown);
                if (keyTown[1] === resultMatch[1]) {
                    matched++;
                    dataStored.setField('town', town);
                    dataStored.setField('city', towns[town].parent_city);
                    dataStored.setField('region', towns[town].parent_region);

                    var correctName = towns[town].name;
                }
            }
        }
        if (matched === 1 && this.arrayTowns.indexOf(correctName) !== -1) {
            callback(correctName);
        } else {
            this.resetLocationDetails(dataStored);
            callback(false);
        }
    },
    setLocationDetailsFromCity: function (locationName, dataStored, callback) {
        var matched = 0;
        var slug_locationName = this.utilSlug(locationName);
        var cities = this.jsonConfig.locations[0].cities;

        this.resetLocationDetails(dataStored);

        for (city in cities) {
            if (cities[city].key === slug_locationName) {
                matched++;
                var match = city.match('^([0-9]+)_([0-9]+)$');
                var correctName = cities[city].name;
                dataStored.setField('city', parseInt(match[2]), 10);
                dataStored.setField('region', cities[city].parent_region);
            }
        }
        if (matched === 1 && this.arrayCities.indexOf(correctName) !== -1) {
            callback(correctName);
        } else {
            this.resetLocationDetails(dataStored);
            callback(false);
        }
    },
    setLocationDetails: function (locationName, dataStored, type, callback) {
        if (type === 'town') {
            this.setLocationDetailsFromTown(locationName, dataStored, callback);
        } else if (type === 'city') {
            this.setLocationDetailsFromCity(locationName, dataStored, callback);
        }
    },
    uploadImage: function (image, callback) {
        $.post(this.jsonConfig.apiUrlUploadImage, image, function (response) {
            callback(response);
        });
    },
    aiFormVerify: function (dataStored, callback) {
        dataStored['ch'] = this.getChannelForm();
        if (!dataStored.hasOwnProperty("passwd")) {
            dataStored["passwd"] = "";
            dataStored["passwd_ver"] = "";
        }
        $.post(this.jsonConfig.apiUrlAiFormVerify, dataStored, function (response) {
            callback(response);
        });
    },
    aiFormCreate: function (dataStored, callback) {
        dataStored['ch'] = this.getChannelForm();
        $.post(this.jsonConfig.apiUrlAiFormCreate, dataStored, function (response) {
            callback(response);
        });
    },
    getChannelForm: function () {
        if (typeof is_mobile != "undefined" && is_mobile) {
            return 15;
        } else {
            return 9;
        }
    }
}

function showThresholds(catName,macro_cat){
    var prodName='';

    switch (macro_cat){
        case "1":
            prodName = "Automotive";
            break;
        case "6":
            prodName = "Real Estate";
            break;
        case "24":
            prodName = "Job";
            break;
        default:
            prodName = '';
    }
    if(prodName!==''){
        $('#thresholds_prod_name').text(prodName);
        $('[data-dialog="#dialog_thresholds"]').click();

    }else{
        $('[data-dialog="#dialog_thresholds_gen"]').click();
    }
}

var AD = {
    values: {},
    mainImage: null,
    extraImages: [],

    errors_map: {
        "ERROR_TOO_MANY_ADS": {
            "type": 1,
            "value": "Hai raggiunto il numero massimo di annunci",
            "func": subito.thresholds.showThresholdsPopup

        },
        "ERROR_ADDRESS_TOO_SHORT": {
            "type": 0,
            "value": "L'indirizzo è troppo corto"
        }
    },
    getAllUrlImages:function(){
        var imagesUrl = [];
        if (this.mainImage !== null){
            imagesUrl.push(this.mainImage.getImageURL());
        }
        if(this.extraImages.length > 0 ){

            for (image in this.extraImages){
                imagesUrl.push(AD.extraImages[image].getImageURL());
            }
        }
        return imagesUrl;
    },
    setField: function (key, value) {

        if (this.values[key] !== value && typeof (value) !== 'undefined') {
            if (value === '') {
                this.delField(key);
            } else {
                this.values[key] = value;
                if (currentAction === 'edit' || currentAction === 'prolong') {
                    trackXiti.track('new_'+currentAction+'::form_1', '0', 1);
                }else{

                    trackXiti.track('new_newad::form_1', '0', 1);
                }

            }
            this.resetFieldsRequiring(key);
        }
    },
    setDefault: function (key, value) {
        'use strict';
        if (this.values[key] !== value && typeof (value) !== 'undefined') {
            if (value === '') {
                this.delField(key);
            } else {
                this.values[key] = value;
            }
        }
    },
    getLatitude:function(){
        'use strict';
        var latitude = '';

        if (typeof (this.values.latitude) !== 'undefined' && this.values.latitude !== null){
            latitude = this.values.latitude;
            latitude = latitude.substring( 0,latitude.indexOf('.') + 5 );
            return latitude;
        }

        if (typeof (this.values.map) !== 'undefined' && this.values.map !== null){
            latitude = (this.values.map).split(',')[0];
            latitude = latitude.substring( 0,latitude.indexOf('.') + 5 );
        }
        return latitude;

    },
    getLongitude:function(){
        'use strict';
        var longitude   = '';

        if (typeof (this.values.longitude) !== 'undefined' && this.values.longitude !== null){
            longitude = this.values.longitude;
            longitude = longitude.substring( 0,longitude.indexOf('.') + 5 );
            return longitude;
        }
        if (typeof (this.values.map) !== 'undefined' && this.values.map !== null){
            longitude = (this.values.map).split(',')[1];
            longitude = longitude.substring( 0,longitude.indexOf('.') + 5 );
        }
        return longitude;

    },
    getField: function (key) {
        'use strict';
        if (key === 'map') {
            key = 'address';
        }

        if (typeof (this.values[key]) === 'undefined') {
            return '';
        } else {
            return this.values[key];
        }
    },

    resetFieldsRequiring: function (key) {
        var currentFields = API.concateFields();
        $.each(currentFields, function (i, field) {
            if (field.requires === key) {
                // XXX TODO: this filter should be done on each fields that
                // requires an API call
                if (field.qs === 'category' || field.qs === 'type' || field.qs === 'company_ad') {
                    AD.delField(field.qs);
                } else {
                    AD.resetField(field.qs);
                }
            }
        });
    },
    resetField: function (key) {
        var field = API.getFieldByQs(key);
        if (field && typeof (field['default']) !== 'undefined') {
            this.setDefault(key, field['default']);
        } else {
            this.delField(key);
            if (["carversion", "bikeversion"].indexOf(key) >= 0) {
                $('select[name="' + key + '"]').empty();
                $('select[name="' + key + '"]').append('<option selected="selected">' + field.placeholder_requires + '</option>');
                $('select[name="' + key + '"]').attr('disabled', 'disabled');
            }
        }
    },
    fillDataWithObject: function (obj) {
        if (obj) {
            $.each(obj, function (key, val) {
                if (key === 'image') {
                    AD.addMainImage(null, val);
                } else if (key === 'images') {
                    $.each(val, function (i, imgName) {
                        AD.addExtraImage(null, imgName);
                    });
                } else {
                    AD.setDefault(key, val);
                }
            });
            API.setCitiesAndTowns(this.getField('city'),this.getField('region'));
        }
    },
    delField: function (key) {
        delete this.values[key];
        this.resetFieldsRequiring(key);
    },
    getRequiredFields: function () {
        var requiredFields = {};
        var nameRequiredFields = ['category', 'type', 'company_ad', 'clothing_type', 'town', 'city'];
        for (var name in nameRequiredFields) {
            if (typeof (this.values[nameRequiredFields[name]]) !== 'undefined') {
                requiredFields[nameRequiredFields[name]] = this.values[nameRequiredFields[name]];
            }
        }

        return requiredFields;
    },
    getPostFields: function (fields) {
        var postData = {};
        for (var field_name in fields) {
            value = this.getField(fields[field_name]);
            if (value != "")
                postData[fields[field_name]] = value;
        }
        return postData;
    },
    showErrors: function (form_name, class_errors, prefix_error_fields, errors_obj) {
        this.clearErrors(class_errors);
        if (currentAction === 'edit' || currentAction === 'prolong') {
            trackXiti.track('new_'+currentAction+'::form_error', '0', 0);
        }else{
            trackXiti.track('new_newad::form_error', '0', 0);
        }
        AIFORM.refreshCaptcha();
        for (var field in errors_obj) {
            this.showError(form_name, class_errors, prefix_error_fields, field, errors_obj[field]);
        }
    },
    showError: function (form_name, class_errors, prefix_error_fields, field, field_value) {
        input_field = "form#" + form_name + " *[name='" + field + "']";
        error_field = prefix_error_fields + field;
        if ($('#' + error_field).length) {
            if (this.errors_map[field_value]) {
                error_msg = this.errors_map[field_value].value;
                error_func = this.errors_map[field_value].func;
                error_type = this.errors_map[field_value].type;

                switch (error_type) {
                    case 1:
                        // alert(error_msg)
                        var provider, options;
                        provider='';
                        options = {
                            'category': $("select[name='category'] option:selected").text(),
                            'name':AD.getField('name'),
                            'phone':AD.getField('phone'),
                            'email':AD.getField('email'),
                            'pop_type':'freemium'

                        };

                        error_func(provider, options);
                        break;

                    default:
                        $(input_field).addClass('inputError');
                        $('#' + error_field).html(error_msg);
                        $('#' + error_field).show();
                }
            } else {
                $(input_field).addClass('inputError');
                $('#' + error_field).html(field_value);
                $('#' + error_field).show();
            }
        }else if (field=='extra_image'){
            $('#error-messages div').hide();
            showErrorMessage('extra_image', {
                message: field_value
            });
        }
    },
    clearErrors: function (class_errors) {
        $("." + class_errors).html("");
        $(".inputError").removeClass("inputError");
    },
    clearError: function (class_errors, id_error) {
        $("#" + id_error).html("");
    },
    addMainImage: function (localName, serverName) {
        newImage = new AdImage();
        newImage.localName = localName;
        newImage.serverName = serverName;
        if (serverName) {
            newImage.uploaded = true;
        }

        this.mainImage = newImage;
    },
    addExtraImage: function (localName, serverName) {
        newImage = new AdImage();
        newImage.localName = localName;
        newImage.serverName = serverName;
        if (serverName) {
            newImage.uploaded = true;
        }

        this.extraImages.push(newImage);
    },
    addImage: function (localName, serverName) {
        newImage = new AdImage();
        newImage.localName = localName;
        newImage.serverName = serverName;
        if (serverName) {
            newImage.uploaded = true;
        }

        if (!this.mainImage) {
            this.mainImage = newImage;
        } else {
            this.extraImages.push(newImage);
        }
    },
    removeImage: function (n, img, callback) {
        $.post(API.jsonConfig.apiUrlRemoveImage, {
            img: n
        }, function (response) {
            if (response.status == "KO") {
                return false;
            } else if (response.status == "OK") {
                if (n == 0) {
                    AD.removeMainImage();
                } else {
                    AD.removeExtraImage(n - 1);
                }

                callback(img);
                return true;
            }
        });
    },
    removeMainImage: function () {
        if (this.extraImages.length > 0) {
            this.mainImage = this.extraImages[0];
            this.removeExtraImage(0);
        } else {
            this.mainImage = null;
        }
    },
    removeExtraImage: function (n) {
        this.extraImages.splice(n, 1);
    }

};

var AdImage = function () {
    return {
        uploaded: false,
        localName: null,
        serverName: null,

        getThumbURL: function () {
            if (!this.serverName) {
                return null;
            }
            dir = '/bigthumbs/' + this.serverName.substring(0, 2) + '/';
            return API.jsonConfig.imageBaseURLs + dir + this.serverName;
        },
        getImageURL: function () {
            if (!this.serverName) {
                return null;
            }
            dir = '/images/' + this.serverName.substring(0, 2) + '/';
            return API.jsonConfig.imageBaseURLs + dir + this.serverName;
        }
    };
};
dCacheDate = new Date();
sCacheYear = dCacheDate.getFullYear();
sCacheMonth = (dCacheDate.getMonth()+1)>9?dCacheDate.getMonth()+1+'':'0'+(dCacheDate.getMonth()+1);
sCacheDay = (dCacheDate.getUTCDate())>9?dCacheDate.getUTCDate()+'':'0'+(dCacheDate.getUTCDate());
sCacheDate = sCacheYear+sCacheMonth+sCacheDay;

Message = {

    show: function (sText, sType) {
        sType = sType || 'loading';
        MSGOption = {
            message: '<h1 style="color:black;">' + sText + '</h1>',
            ignoreIfBlocked: true,
            onBlock: function() {
                window.uiBlocked = true;
            },
            onUnblock: function() {
                window.uiBlocked = false;
            },
            css: (function () {
                if (is_mobile) {
                    return {
                        'color': '#666',
                        'padding': '15px',
                        'backgroundColor': '#fff',
                        'margin-left': '-130px',
                        'left': '54%',
                        'width': '220px',
                        '-webkit-border-radius': '10px',
                        '-moz-border-radius': '10px',
                        'border': '5px solid #555',
                        'overlayCSS': {
                            'backgroundColor': '#000',
                            'opacity': 0.6,
                            'cursor': 'wait'
                        }
                    };
                } else {
                    return {
                        'padding': '20px',
                        'backgroundColor': '#fff',
                        'width': '250px',
                        'margin-left':'-125px',
                        'left':'50%',
                        '-webkit-border-radius': '10px',
                        '-moz-border-radius': '10px',
                        'border-radius':'10px',
                        'border': '5px solid #555',
                        'overlayCSS': {
                            'backgroundColor': '#000',
                            'opacity': 0.4,
                            'cursor': 'wait'
                        }
                    };
                }
            })()
        };

        switch (sType) {
            case 'error':
                if (is_mobile) {
                    MSGOption.message = '<div class="closeMSG"></div><h1 style="font-weight:600;font-size:18px;">' + sText + '</h1><br>Il sistema non ha risposto correttamente';
                } else {
                    MSGOption.message = '<div class="closeMSG"></div><h1 style="font-weight:600;font-size:20px;">' + sText + '</h1><br>Il sistema non ha risposto correttamente';
                }
                break;
            case 'loading':
                if (is_mobile) {
                    MSGOption.message = '<h1 style="color:#000;font-weight:600;font-size:18px;">' + sText + '</h1>';
                } else {
                    MSGOption.message = '<h1 style="color:#000;font-weight:600;font-size:20px;">' + sText + '</h1>';
                }
                break;
            case 'timeout':
                if (is_mobile) {
                    MSGOption.message = '<div class="closeMSG" ><img src="' + base_url + '/img2/x_pop_close.png" style="width:35px"></div><h1 style="font-weight:600;font-size:18px;">' + sText + '</h1>';

                } else {
                    MSGOption.message = '<div class="closeMSG" ><img src="' + base_url + '/img2/x_pop_close.png" style="width:35px"></div><h1 style="font-weight:600;font-size:20px;">' + sText + '</h1>';

                }

                break;

        }


        $.blockUI(MSGOption);
    },

    hide: function () {
        $.unblockUI();
    },

    error: function(evento, ajqxhr, settings) {
        api_error = true;
        if (ajqxhr.statusText === 'timeout') {
            Message.show('In questo momento il sistema non risponde correttamente.<br> Riprova più tardi.', 'timeout');
        } else {
            Message.show('Si è verificato un errore...', 'error');
        }
    }

};

var AIFORM = {

    slider: null,
    currentImageRow: null,
    currentInputMap: null,
    currentMaxImages: 0,
    itemsPreviewInOthers: 0,
    paidOptionsMap: Array(),
    paidUrl: null,

    verifyTerms: function (check_terms_id) {
        if (!$("#" + check_terms_id).is(":checked")) {
            alert("Per procedere devi accettare le condizioni generali di vendita");
        } else if (AIFORM.paidUrl != null) {
            location.href = AIFORM.paidUrl;
        }
    },
    doneImages: function (container, callback) {
        $(container).children('.picture-placeholder-full').each(function () {
            if ($(this).hasClass('main')) {
                $(this).attr('class', 'picture-placeholder-done medium main');
            } else {
                $(this).attr('class', 'picture-placeholder-done medium');
            }
        });
        callback();
    },
    appendPhotos: function (AD, mainImage, callback) {
        $("#listphotos #slideGallery").empty();
        var lastImageId = 'slideImg';
        var divNodeImage = '';
        var widthHeightStrNoImage = '';
        //if is_mobile and there isn't image set retina main image
        if (is_mobile && mainImage == base_url + '/img2/icon80-no-foto.png') {
            mainImage = base_url + '/img2/icon80-no-foto-2x.png';
            widthHeightStrNoImage = ' width="80" height="80"';
        }
        var divNodeImage = "<li class='bxslider-inner'><img "+ widthHeightStrNoImage +" id='" + lastImageId + "' title='Immagine principale' src='" + mainImage + "' class='img_slider' /></li>";
        for (var i = 0; i < AD.extraImages.length; i++) {
            lastImageId = 'slideImg' + i;
            divNodeImage += "<li class='bxslider-inner' style='width:100%'><img id='" + lastImageId + "' src='" + AD.extraImages[i].getImageURL() + "' class='img_slider' /></li>";
        };

        $("#listphotos #slideGallery").append(divNodeImage);
        if ((mainImage == base_url + '/img2/icon80-no-foto.png')||(mainImage == base_url + '/img2/icon80-no-foto-2x.png')){
            callback('no_photo');
        } else {
            callback('ok_photo');
        }
    },
    autoTitle: function (brand, model, year) {


        var title = '';

        if (brand) {
            title = brand;
        }

        if (model) {
            if (title.length > 0 ) {
                title = title + ' ' + model;
            } else {
                title = model;
            }
        }

        if (year) {
            if (title.length > 0 ) {
                title = title + ' - ' + year;
            }
        }

        return title;
    },
    buildPreview: function (AD) {
        $("#listphotos #slideGallery").empty();
        $("#slideGallery").css("left", "0px");
        this.itemsPreviewInOthers = 0;
        /** ** IMAGE PREVIEW *** */
        if (AD.getField('category') == '26') {
            // REMOVED IN JOB CATEGORY
            $('#photo').hide();
        } else {
            // CHECK IF ELEMENTS ARE HIDDEN
            if ($('#photo').is(':hidden')) {
                $('#photo').show();
            }
            var mainImage = base_url + '/img2/icon80-no-foto.png';
            if (AD.hasOwnProperty("mainImage") && AD.mainImage !== null) {
                mainImage = AD.mainImage.getImageURL();
            }

            $('#aiPreview #prev_photo').attr('src', mainImage);

            if ($("#backgroundWhiteMobile").length > 0) {
                this.appendPhotos(AD, mainImage, function (check_photo) {
                    var loaded = 0;
                    var numImages = $('.img_slider').length;
                    if (check_photo != 'no_photo') {
                        $('.img_slider').one('load', function () {
                            if (loaded < numImages) {
                                ++loaded;
                                if (loaded === numImages) {
                                    $('#listphotos').show(function () {
                                        AIFORM.slider = $('#slideGallery').bxSlider({
                                            auto: false,
                                            adaptiveHeight: false,
                                            responsive: true,
                                            preloadImages: 'all',
                                            captions: true,
                                            mode: 'fade',
                                            slideWidth: 5000,
                                            minSlides: 1,
                                            maxSlides: 1,
                                            moveSlides: 1,
                                            slideMargin: 0,
                                            speed: 0,
                                            onSliderLoad: function() {
                                                //force first element to be displayed in table-cell, because plugin ignore css rule
                                                $('.bxslider li').eq(0).css({'display': 'table-cell'});
                                            }
                                        });
                                    });
                                }
                            }
                        }).each(function () {
                            if (this.complete) {
                                $(this).load();
                            }
                        });
                    } else {
                        $('#listphotos').show();
                    }
                });
            } else {
                if (AD.hasOwnProperty("extraImages") && typeof (AD.extraImages) != "undefined") {
                    for (var i = 0; i < AD.extraImages.length; i++) {
                        var divNodeRow = $("<div class='rowNode'></div>");
                        var divNodeImage = $("<div class='singleImage'><img src='" + AD.extraImages[i].getThumbURL() + "' /></div>");
                        divNodeRow.append(divNodeImage);
                        $("#listphotos #slideGallery").append(divNodeRow);
                    };
                };
            };
        }
        /** * END IMAGE ** */

        // REMOVE OLD ELEMENTS
        //$('#aiPreview .subContainer').children('.row').remove();
        $('#aiPreview .subContainer > #others').children('.row').remove();

        // POPULATE NEW ELEMENTS
        var arrayFieldsSaved = API.concateFields();

        $.each(arrayFieldsSaved, function () {
            AIFORM.populatePreviewElem(this.qs, AD.values[this.qs]);
        });

        /* HIDE SHOW ALL ELEMENT */
        if (this.itemsPreviewInOthers <= 3) {
            $('#showAll').hide();
        } else {
            $('#showAll').show();
        }

        /* PAIDOPTIONS */
        API.getPaidOptions($('#aiPreview > .container'), AIFORM.buildPaidOptions);

        /* HIDE & SHOW ELEMENTS */
        window.location.hash = "verify";
        Message.hide();
    },
    buildForm: function (steps) {

        if ($('#imguploadrow').length) {
            var script_node = $('<script>AIFORM.setImageUploaderInfo();</script>');
            AIFORM.currentImageRow = $('form#aiform div#imguploadrow').detach();
            AIFORM.currentImageRow.append(script_node);
        };

        if ($('#inputmaprow').length) {
            AIFORM.currentInputMap = $('form#aiform div#inputmaprow').detach();
        };

        $("div#newform").empty();

        $.each(steps, function (index) {

            domContainer = $("<div class=\"container step_" + index + "\"></div>");
            if (this.header) {
                domContainer.append($("<div class='rowNode'><label class='lfloat'>&nbsp;</label><div class='boxInput lfloat'><h3>" + this.header + "</h3></div>"));
            };

            $.each(this.fields, function (iField, field) {
                var tmpDomToAppend = AIFORM.createDomElem(AIFORM.formatHTMLType(field), AD.getField(field.qs), currentAction);
                if (tmpDomToAppend) {
                    domContainer.append(tmpDomToAppend);
                }
                AIVALIDATOR.addRule(field.qs, field.validators);
            });
            $("div#newform").append(domContainer);
        });

        if (AD.hasOwnProperty("category_price") && AD.values.hasOwnProperty("type") && AD.category_price[AD.values.type] != "0") {

            var catPriceCont = $("<br><span style='display:block;margin-left:4px;margin-top:10px;'>Un annuncio in <a data-dialog='#dialog_cat_priced_"+ AD.values.category +"'  >questa categoria</a> costa &euro; " + AD.category_price[AD.values.type] + " </span>");
            $("select[name='category']").after(catPriceCont);
        };
        $('form#aiform').find('.container').remove();
        $("div#newform").children().each(function () {
            $("form#aiform").append($(this).detach());
        });
        popOverInitButton();
        if (AD.values.latitude && AD.values.longitude) {
            $("#latitude").val(AD.values.latitude);
            $("#longitude").val(AD.values.longitude);

        };

        // DATEPICKER
        if ($("input[name='cites_cert_date']").length > 0 ) {
            $("input[name='cites_cert_date']").datepicker({
                dateFormat : "dd-mm-yy",
                firstDay : 1,
                dayNamesMin : [ "Do", "Lu", "Ma", "Me", "Gi", "Ve", "Sa" ],
                dayNamesShort : [ "Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab" ],
                dayNames : [ "Domenica", "Lunedï¿œ", "Martedï¿œ", "Mercoledï¿œ", "Giovedï¿œ", "Venerdï¿œ", "Sabato" ],
                monthNames : [ "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre" ],
                maxDate:new Date()
            });
        };

        if ($("input[name='town']").length > 0 || $("input[name='city']").length > 0) {
            sName = "city";
            if ($("input[name='town']").length > 0) {
                sName = "town";
            }

            $("input[name='" + sName + "']").autocomplete({
                minLength: '3',
                source: function (request, response) {
                    var matches = $.map(API.getAutocompleteValuesForField(sName), function (tag) {
                        if (tag.toUpperCase().indexOf(request.term.toUpperCase()) === 0) {
                            return tag;
                        }
                    });
                    response(matches.slice(0, 10));
                },
                messages: {
                    noResults: '',
                    results: function () {}
                },
                focus: function(e,ui) {
                    var acData = $("input[name='" + sName + "']").data("uiAutocomplete"),
                        acMenuElements = $(acData.menu.element).find("li"),
                        acActiveElement = $(acData.menu.active);

                    acMenuElements.removeClass("selected");
                    acActiveElement.addClass("selected");
                }
            });

            /* Override jQuery UI function for formatting autocomplete list item  */
            $("input[name='" + sName  + "']").data("uiAutocomplete")._renderItem = function(ul, item) {

                var acData = $("input[name='" + sName + "']").data("uiAutocomplete");

                if (acData) {
                    var acTermRegex = new RegExp("(" + $.ui.autocomplete.escapeRegex(acData.term) + ")", "gi"),
                        acTownRegex = new RegExp("(\\(?([a-z]+)?\\))$", "gi"),
                        acContent = item.label;

                    acContent = acContent.replace(acTermRegex, '<span class="autocomplete-highlight">$1</span>');
                    acContent = acContent.replace(acTownRegex, '<span class="autocomplete-town">$1</span>');
                }

                return $( "<li>" ).data("item.autocomplete", item).html( "<a>" + acContent + "</a>" ).appendTo( ul );
            }

            $("input[name='" + sName + "']").keypress(function (e) {
                var code = (e.keyCode ? e.keyCode : e.which);
                if (code == 13) { //Enter keycode
                    return false;
                }
            });
        };
        $("body").addClass("no_drop_area");
        if ($("#fileSelect").length > 0 && AIFORM.currentImageRow == null) {
            window.URL = window.URL || window.webkitURL;

            orientation_list = new Array();
            files_list = new Array();

            max_height = 100;
            max_width = 180;

            preview_height = 310;
            preview_width = 370;

            upload_width = 622;
            upload_height = 468;
            upload_image_quality = parseFloat(0.9);
            if (!upload_image_quality) {
                upload_image_quality = 1.0;
            }
            image_size = "622x468";
            if (image_size) {
                image_size = image_size.split("x");
                upload_width = parseInt(image_size[0]);
                upload_height = parseInt(image_size[1]);
            };

            mainContainerName = "fileList";

            rows_number = Math.floor((max_uploadable - 1) / max_in_a_row);
            if (max_uploadable % max_in_a_row > 0) {
                rows_number += 1;
            };

            extra_boxes = 1; // Number of images out of the normal
            // visualization
            auto_resize_fileList = false;

            if (auto_resize_fileList) {
                var box_size = 108;
                document.getElementById(mainContainerName).style.width = (box_size * max_in_a_row) + "px";
                document.getElementById("preview").style.marginLeft = (Math.round(box_size / 2) * (max_in_a_row - 3)) + "px";
            };

            var fileSelect = document.getElementById("fileSelect");
            var fileElem = document.getElementById("fileElem");
            var fileList = document.getElementById(mainContainerName);
            var toHide = previewPosition % max_in_a_row;

            y = max_in_a_row > (image_length - 1) ? max_in_a_row - (image_length - 1) : max_in_a_row - ((image_length - 1) % max_in_a_row);
            y = image_rim < y ? image_rim : y;
            y--;

            var clearfloat = document.createElement("div");
            clearfloat.style.clear = "both";
            clearfloat.style.height = "10px";
            fileList.appendChild(clearfloat);

            fileElem.onchange = function (e) {
                handleFiles(this.files);
            };

            // Gestione drag & drop

            dropbox = document.getElementById(mainContainerName);
            no_drop_area = document.getElementsByClassName("no_drop_area")[0];
            start_content = document.getElementById("start-content");

            dropbox.ondragenter = dragenter;
            dropbox.ondragover = dragovercontinue;
            dropbox.ondrop = drop;
            dropbox.ondragleave = dragleavecontinue;
            dropbox.onclick = clickinit;

            start_content.ondragover = dragovercontinue;
            start_content.ondragleave = dragleavecontinue;

            no_drop_area.ondragenter = dragenter;
            no_drop_area.ondragover = dragover;
            no_drop_area.ondrop = droperror;

        }

        AIFORM.currentImageRow = null;
        var adCategory = $('select[name="category"]').val() || 0,
            adStatus   = currentAction;
        type = $('input[name="type"]:checked').val() || 's';

        objCat.init(adCategory, type,adStatus);
        window.location.hash = 'insert';

        if ($('#captcha').length > 0) {
            $('#captcha').show();
        };

        AIVALIDATOR.applyRules($('form#aiform'));
        AIUSER.getAllData();
        Message.hide();

        AIFORM.showInsert();
    },

    formatHTMLType: function (elem) {
        switch (elem.type) {
            case "text":
            case "town":
            case "city":
                myElem = "input";
                myType = "text";
                if (elem.format == "password") {
                    myType = "password";
                }
                break;
            case "password":
                myElem = "input";
                myType = "password";
                break;
            case "category":
            case "select":
            case "zone":
                myElem = "select";
                myType = "";
                break;
            case "adType":
            case "user_type":
                myElem = "input";
                myType = "radio";
                break;
            case "textarea":
                myElem = "textarea";
                myType = "";
                break;

            case "boolean":
            case "multiselect":
            case "paidoptions":
                myElem = "input";
                myType = "checkbox";
                break;
            case "tos":
                myElem = "input";
                myType = "checkbox";
                elem.label = elem.label.replace(/\/info/g, jsonConfiguration.cms);
                break;
            case "photo":
                myElem = "input";
                myType = "imguploader";
                break;
            case "map":
                myElem = "map";
                myType = "map";
                break;
            case "label":
                myElem = "label";
                myType = "";
                break;
            default:
                myElem = "input";
                myType = "text";
                break;
        };

        if (elem.hidden == "1") {
            myElem = "input";
            myType = "hidden";
        }

        elem.myElem = myElem;
        elem.myType = myType;
        elem.get = function (field) {
            if (elem[field]) {
                return elem[field];
            } else {
                return "";
            };

        };
        return elem;

    },
    createDisabledNode: function(obj) {
        var node = document.createElement('span'),
            myVal = AD.getField(obj.qs).toString(),
            value;

        if (!myVal && obj.get("default") != "") {
            myVal = obj.get("default");
            AD.setDefault(obj.qs, myVal);
        };

        switch (obj.qs) {
            case 'city':
                value = API.getDisplayValue(obj.qs, AD.getField('region') + '_' + myVal);
                break;
            case 'regdate':
                value = myVal;
                break;
            case 'category':
                value = API.getDisplayValue(obj.qs, myVal);
                AIFORM.setCategoryPrice(myVal);
                break;
            default:
                value = API.getDisplayValue(obj.qs, myVal);
        }

        node.innerHTML = value;
        node.setAttribute('data-input-name', obj.qs);
        node.className = 'disabledField lfloat';

        return node;
    },
    createInputNode: function (obj) {
        var node = document.createElement('input'),
            myVal = AD.getField(obj.qs);

        node.id = obj.qs;

        if (!myVal && obj.get('default') != '') {
            myVal = obj.get('default');
            AD.setDefault(obj.qs, myVal);
        };

        if (obj.type == 'town') {
            node.value = API.getDisplayValue(obj.qs, myVal);
        } else if (obj.type == 'city') {
            node.value = API.getDisplayValue(obj.qs, AD.getField("region") + "_" + myVal);
        } else {
            node.value = myVal;
        }
        node.name = obj.qs;

        if (obj.myType) {
            node.type = obj.myType;
        }
        if (obj.get("placeholder") != "") {
            if (obj.requires != "" && AD.getField(obj.requires) == "" && obj.placeholder_requires) {
                node.placeholder = obj.placeholder_requires;
            } else {
                node.placeholder = obj.placeholder;
            }
        }
        if(obj.qs == 'passwd' || obj.qs == 'passwd_ver'){
            node.setAttribute("autocomplete", "off");
        }
        if (obj.get("optional") != 1) {
            node.setAttribute("required", true);
        }
        if (obj.get("maxlength") != "") {
            node.setAttribute("maxlength", obj.maxlength);
        }
        if (obj.qs == 'price') {
            node.setAttribute("class", "lfloat");
        };

        return node;
    },
    createHiddenNode: function (obj) {
        var node = document.createElement("input");
        node.name = obj.qs;
        node.type = "hidden";

        var myVal = AD.getField(obj.qs);
        if (!myVal && obj.get("default") != "") {
            myVal = obj.get("default");
            AD.setDefault(obj.qs, myVal);
        };
        node.value = myVal;

        return node;
    },
    createRadioNode: function (obj) {
        var nodes = document.createElement("div");
        var myVal = AD.getField(obj.qs);
        if (!myVal && obj.get("default") != "") {
            myVal = obj.get("default");
            AD.setDefault(obj.qs, myVal);
        };
        if (obj.value_list) {
            var vListValue = API.getOptionValuesForField(obj);

            if (typeof (vListValue) != "undefined") {
                for (var i = 0; i < vListValue.length; i++) {
                    var myObj = vListValue[i];
                    var node = document.createElement("input");
                    node.type = "radio";
                    node.name = obj.qs;
                    if (obj.optional != 1) {
                        node.setAttribute("required", true);
                    };
                    if (myObj.id == myVal) {
                        node.setAttribute("checked", "checked");
                    };
                    node.value = myObj.id;
                    nodeLabel = $("<span>" + myObj.value + "</span>");
                    $(nodes).append(node);
                    $(nodes).append(nodeLabel);
                };
            };
        };
        return nodes;

    },
    createCheckboxNode: function (obj, disabled, action) {
        var myVal = AD.getField(obj.qs),
            nodes = $('<div ></div>');

        if (obj.type === 'boolean' || obj.type === 'tos') {
            for (var item in [1]) {
                /* CREATE CHECKBOX */
                node = document.createElement('input');
                node.type = 'checkbox';
                node.name = obj.qs;
                node.value = 1;

                if (disabled) {
                    node.setAttribute('disabled', 'disabled');
                }

                if (obj.qs === 'accept_equal_opp' || myVal === 1 || (obj.qs === 'tos' && (disabled || action === 'edit'))) {
                    node.setAttribute('checked', 'checked');
                    AD.setDefault(obj.qs, 1);
                } else {
                    AD.setDefault(obj.qs, 0);
                }
                $(nodes).append(node);

                /* CREATE LABEL */
                if (obj.qs === 'tos') {
                    var sTerm = obj.url,
                        sDesc = obj.label;
                    node.setAttribute('required', true);
                    $(nodes).append($('<span class="tos">'+ sDesc + '</span>'));

                } else if (obj.qs === 'accept_equal_opp') {
                    node.setAttribute('required', true);
                    $(nodes).append($('<span class="tos">' + obj.label + '</span>'));
                } else {
                    $(nodes).append($('<span>' + obj.label + '</span>'));
                }

            }
        } else {
            //@ToDo: Annunci di lavoro checkbox settati
            if (obj.value_list) {
                var countCheckbox = 0;
                var vCheckboxs = API.getOptionValuesForField(obj);
                if (typeof (vCheckboxs) !== 'undefined') {
                    for (var i = 0; i < vCheckboxs.length; i+=1) {
                        var objCheckbox = vCheckboxs[i];
                        var nodeContainer = $('<div class="containerCheckboxs"></div>"');
                        var node = document.createElement('input');
                        node.type = 'checkbox';
                        node.name = obj.qs;

                        if (myVal.indexOf(objCheckbox.id) >= 0) {
                            node.setAttribute('checked', 'checked');
                        }

                        node.value = objCheckbox.id;
                        var nodeLabel = $('<span>' + objCheckbox.value + '</span>');
                        $(nodeContainer).append(node);

                        /* CREATE LABEL */
                        if (countCheckbox % 2 === 1) {
                            nodeLabel = $('<span >' + objCheckbox.value + '</span>');
                        } else {
                            nodeLabel = $('<span>' + objCheckbox.value + '</span>');
                        }
                        $(nodeContainer).append(nodeLabel);
                        $(nodes).append(nodeContainer);
                        countCheckbox+=1;
                    }
                }
            }
        }

        return nodes;
    },
    createMapNode: function (obj) {
        sAddress = AD.getField("address");
        sMapVisibility = AD.getField("address") == "" ? "none" : "block";
        if (sMapVisibility != "none") {
            var nodes = $("<div><input type='radio' name='visMappa' value='0' ><span>No</span><input type='radio' name='visMappa' value='1' checked='checked'><span>Si</span></div>");
        } else {

            var nodes = $("<div><input type='radio' name='visMappa' value='0' checked='checked'><span>No</span><input type='radio' name='visMappa' value='1'><span>Si</span></div>");
        }

        divMapContainer = $('<div id="inputmap" class="clearfix"  style="display: ' + sMapVisibility + ';">\
                            <div id="map_search_field" style="margin-top:20px;">\
                            <input type="text" name="address" id="address" class="maptip" placeholder="Scrivi qui l\'indirizzo e clicca su \'Cerca\'" size="43" maxlength="50" value="' + sAddress + '"> <button class="btn_sec btn_small"  name="findonmap" id="findonmap" style="width:100px;height:35px;margin-left:20px;float: left;" > Cerca</button>\
                            <div class="clearfix"></div>\
                                      <p class="esText" style="margin:5px 0 20px;">Ad esempio: Via Roma 1</p>\
                                      </div>\
                                      <input type="hidden" id="latitude" name="latitude" value=""><input type="hidden" id="longitude" name="longitude" value=""><input type="hidden" id="zoom" name="zoom" value="">\
                                      <div id="map_help" style="display: none; max-width: 450px;"></div>\
                                      <div id="map_canvas" style="display: ' + sMapVisibility + ';"></div>\
                                      </div>');

        $(nodes).append(divMapContainer);
        include_script("https" + "://" + "maps.googleapis.com" + "/" + "maps" + "/" + "api" + "/" + "js?key=AIzaSyDChf5wNdWu69SjfzZuH-mQFdOAdsJdPrM&language=it&async=2&callback=initMap", null);
        return nodes;
    },
    createSelectNode: function (obj) {
        var myVal = AD.getField(obj.qs);

        /*
         Se non ï¿œ stato salvato nessun dato nei cookie
         ed ï¿œ presente un valore standard di default, viene settato
         */
        if (!myVal && obj.get("default") != "") {
            myVal = obj.get("default");
            AD.setDefault(obj.qs, myVal);
        };

        /* Settaggio del placeholder se presente */
        if (obj.get("placeholder") != "") {
            if (obj.requires != "" && AD.getField(obj.requires) == "" && obj.placeholder_requires) {
                sDesc = obj.placeholder_requires;
            } else {
                sDesc = obj.placeholder;
            };
        } else {
            sDesc = "Seleziona";
        };

        if (obj.requires && AD.getField(obj.requires) == "") {
            var node = document.createElement("select");
            node.name = obj.qs;
            var objOption = new Option(sDesc, "");
            objOption.setAttribute("selected", "selected");
            objOption.setAttribute("disabled", "disabled");
            node.setAttribute("disabled", "disabled");
            node.options.add(objOption);
            if (obj.optional != 1) {
                node.setAttribute("required", true);
            };
            return node;
        }

        var myArray = API.getOptionValuesForField(obj);

        if (obj.qs == "category") {

            var node = document.createElement("select");
            node.name = obj.qs;

            if (myVal == "") {
                objOption = new Option(sDesc, "");
                objOption.setAttribute("selected", "selected");
                objOption.setAttribute("disabled", "disabled");
                node.options.add(objOption);
            };
            if (typeof (myArray) != "undefined") {
                var objGroup = null;
                for (var i = 0; i < myArray.length; i++) {
                    if (myArray[i].level == 0) {
                        objGroup = document.createElement('OPTGROUP');
                        objGroup.label = myArray[i].name;
                        node.appendChild(objGroup);
                        continue;
                    };

                    objOption = new Option(myArray[i].name, myArray[i].id);

                    if (myVal == myArray[i].id) {
                        AIFORM.setCategoryPrice(myVal, myArray[i]);
                        objOption.setAttribute("selected", "selected");
                    };
                    objGroup.appendChild(objOption);
                    // node.options.add(objOption);
                };
            };
            if (obj.optional != 1) {
                node.setAttribute("required", true);
            };
            return node;


        } else {
            var node = document.createElement("select");
            node.name = obj.qs;

            objOption = new Option(sDesc, "");
            node.options.add(objOption);
            if (typeof (myArray) != "undefined") {
                for (var i = 0; i < myArray.length; i++) {
                    var myObj = myArray[i];
                    objOption = new Option(myObj.value, myObj.id);
                    if (myObj.id == myVal) {
                        objOption.setAttribute("selected", "selected");
                    }
                    node.options.add(objOption);
                };
            };
            if (obj.optional != 1) {
                node.setAttribute("required", true);
            };
            return node;
        };

    },

    setCategoryPrice: function(categoryId, categoryObj) {
        'use strict';

        var categoryArray,
            i = 0;

        if (!categoryObj) {
            categoryArray = API.getOptionValuesForField({type: 'category'});

            for (i; i < categoryArray.length; i += 1) {
                if (parseInt(categoryId) === parseInt(categoryArray[i].id)) {
                    categoryObj = categoryArray[i];
                }
            }
        }

        if (categoryObj && categoryObj.hasOwnProperty('price')) {
            AD.category_price = categoryObj.price;

            // Category price must be 0 during edit
            if (currentAction === 'edit') {
                AD.category_price = {'s': '0', 'u': '0', 'k': '0', 'a': '0', 'h': '0'};
            }
        } else {
            AD.categoryPrice = '';
        }
    },

    createTextareaNode: function (obj) {

        var myVal = AD.getField(obj.qs);
        var node = document.createElement("textarea");
        node.id = obj.qs;
        node.name = obj.qs;

        if (obj.get("placeholder") != "") {
            node.placeholder = obj.placeholder;
        };
        if (!myVal && obj.get("default") != "") {
            myVal = obj.get("default");
            AD.setDefault(obj.qs, myVal);
        };
        node.value = myVal;

        if (obj.optional != 1) {
            node.setAttribute("required", true);
        };

        if (obj.get("maxlength") != "") {
            node.setAttribute("maxlength", obj.maxlength);
        }
        return node;
    },

    createInputImg: function (htmlElem) {
        // XXX TODO: check whether the user is Pro
        this.currentMaxImages = htmlElem.max_images;
        this.setImageUploaderInfo();

        // TODO Refactoring
        var nodes = $("<div></div>");
        if (jQuery.support.canvas) {
            var node = $('<input type="file" onchange="handleFiles(this.files)"  accept="image/*" multiple="" id="fileElem">');
        } else {
            if (AD.mainImage != null) {
                dropbox_div = "";

                if (previewPosition == 1) {
                    dropbox_div = '\
                                               <div id="dropbox" class="picture-placeholder main-easy">\
                                               <div id="fileSelect" class="thumb"><div class="thumb_add"></div></div>\
                                               </div>';
                } else {
                    for (a = 0; a < (AD.extraImages).length; a++) {
                        dropbox_div += '\
                                                    <div class="picture-placeholder-done clear medium ui-droppable-disabled " style="display: block;" >\
                                                    <img id="image_' + (a + 1) + '" style="display: none;" src="' + AD.extraImages[a].getImageURL() + '">\
                                                    <div class="canvasContainer">\
                                                    <img src="' + AD.extraImages[a].getImageURL() + '" />\
                                                    </div>\
                                                    <div class="icons_container">\
                                                    <div class="remove"></div>\
                                                    </div>\
                                                    </div>';
                    }

                    if (image_rim > 0) {
                        dropbox_div += '\
                                                    <div id="dropbox" class="picture-placeholder main-easy">\
                                                    <div id="fileSelect" class="thumb"><div class="thumb_add"></div></div>\
                                                    <div class="icons_container">\
                                                    <div class="remove"></div>\
                                                    </div>\
                                                    </div>';
                    } else {
                        dropbox_div += '\<div id="dropbox" class="picture-placeholder main-easy" style="display:none"><div id="fileSelect" class="thumb"><div class="thumb_add"></div></div></div>';
                    }

                }

                var node = $('<input type="file" name="fileElem" id="fileElem" multiple accept="image/*" style="visibility: hidden;position: absolute;" onchange="handleFiles(this.files)">\
                                     <div id="upload_widget" class="normal_border">\
                                     <div id="fileList" class="preview upload_container" style="height:auto">\
                                     <div class="picture-placeholder-done medium main ui-droppable-disabled " style="display: block;" >\
                                     <img id="image_0" style="display: none;" src="' + AD.mainImage.getImageURL() + '">\
                                     <div class="canvasContainer">\
                                     <img src="' + AD.mainImage.getImageURL() + '"/>\
                                     </div>\
                                     <div class="icons_container">\
                                     <div class="remove"></div>\
                                     </div>\
                                     </div>' + dropbox_div + '\
                                     <div id="start-content">\
                                     <div id="camera" ></div>\
                                     <div id="message" class="off">Scegli la categoria prima di aggiungere le immagini</div>\
                                     <div id="message" class="init">Trascina qui le immagini o <span>clicca</span> per selezionarle</div>\
                                     </div>\
                                     <div id="body-content" style="display:block">\
                                     <div id="title" class="main-picture">Immagine principale</div>\
                                     <div id="title" class="other-pictures">Altre immagini <span class="remaining">(Puoi aggiungere <span id="number">' + image_rim + '</span> <span id="pictures-subject">immagini</span>)</span></div>\
                                     </div>\
                                     <div>\
                                     </div>\
                                     <div id="preview"></div>\
                                     <div id="error-messages">\
                                     <div id="message" class="format">La tua immagine non risulta essere nel formato jpg, png o gif.</div>\
                                     <div id="message" class="max-n">Si possono inserire al massimo <span id="image-number">' + max_uploadable + '</span> immagini.</div>\
                                     <div id="message" class="dimension">Immagine troppo piccola <span id="filename"></span>: utilizza un\'immagine di almeno 250x100 pixel</div>\
                                     <div id="message" class="dimension-multi">Immagini troppo piccole: utilizza immagini di almeno 250x100 pixel</div>\
                                     </div>');
            } else {
                var node = $('<input type="file" name="fileElem" id="fileElem" multiple accept="image/*" style="visibility: hidden;position: absolute;" onchange="handleFiles(this.files)">\
                                     <div id="upload_widget">\
                                     <div id="fileList" class="init upload_container" style="height:auto">\
                                     <div id="start-content">\
                                     <div id="camera" ></div>\
                                     <div id="message" class="off">Scegli la categoria prima di aggiungere le immagini</div>\
                                     <div id="message" class="init">Trascina qui le immagini o <span>clicca</span> per selezionarle</div>\
                                     </div>\
                                     <div id="body-content">\
                                     <div id="title" class="main-picture">Immagine principale</div>\
                                     <div id="title" class="other-pictures">Altre immagini <span class="remaining">(Puoi aggiungere <span id="number">5</span> <span id="pictures-subject">immagini</span>)</span></div>\
                                     </div>\
                                     <div id="dropbox" class="picture-placeholder main-easy">\
                                     <div id="fileSelect" class="thumb"><div class="thumb_add"></div></div>\
                                     </div>\
                                     </div>\
                                     </div>\
                                     <div id="preview"></div>\
                                     <div id="error-messages">\
                                     <div id="message" class="format">La tua immagine non risulta essere nel formato jpg, png o gif.</div>\
                                     <div id="message" class="max-n">Si possono inserire al massimo <span id="image-number">' + max_uploadable + '</span> immagini.</div>\
                                     <div id="message" class="dimension">Immagine troppo piccola <span id="filename"></span>: utilizza un\'immagine di almeno 250x100 pixel</div>\
                                     <div id="message" class="dimension-multi">Immagini troppo piccole: utilizza immagini di almeno 250x100 pixel</div>\
                                     </div>');
            }
        };
        $(nodes).append(node);
        return nodes;

    },
    createLabelNode: function (obj) {
        var myVal = obj.label;
        var nodes = document.createElement("div");
        $(nodes).html(myVal);
        return nodes;
    },
    populateSelect: function (key, values) {


        var i = 0;
        var element = document.getElementsByName(key);

        for (i; i < values.length; i = i + 1) {
            var option = document.createElement('option');
            option.value = values[i].id;
            option.text = values[i].value;
            $(element).append(option);
        }
        if ($(element).is(':disabled') && values.length > 0) {
            $(element).removeAttr('disabled');
        }
    },
    populatePreviewElem: function (key, value) {
        if (key.length > 0 && typeof (value) != "undefined" && (["tos", "accept_equal_opp", "passwd", "passwd_ver", "type"].indexOf(key) == -1)) {
            objModel = API.getFieldByQs(key);
            var htmlObjModel = this.formatHTMLType(objModel);
            sLabel = htmlObjModel.label;

            if (objModel.type == 'city') {
                sKey = key;
                sValue = AD.getField("region") + "_" + value;
            } else {
                sKey = key;
                sValue = value;
            };

            if (key === 'price') {
                sKey = key;
                sValue = value + " &euro;";
            }

            if (value instanceof Array) {
                sDesc = '';
                for (var i = 0; i < value.length; i++) {
                    sDesc += API.getDisplayValue(sKey, sValue[i]) + "<br>";
                };
            } else if (key == 'map') {
                sDesc = 'Visibile';

            } else {
                sDesc = API.getDisplayValue(sKey, sValue);
            };
            if ($('#prev_' + key).length > 0) {
                if (key == 'phone_hidden') {
                    sDesc = value == 1 ? "(Non visibile nell'annuncio)" : "";
                };
                $("#prev_" + key).html(sDesc);
                if (sDesc != "" && $("#row_" + key).length > 0) {
                    $("#row_" + key).show();
                }
            } else {
                $(".subContainer > #others").append($("<div class=\"row\"><label>" + sLabel + "</label><div id='prev_" + key + "'>" + sDesc + "</div></div>"));
                this.itemsPreviewInOthers = this.itemsPreviewInOthers + 1;
            }

        }
    },
    appendExtraElem: function (divFather, domEleName) {
        switch (domEleName) {
            case 'phone':
                var divPhoneVerified = $('<div id="phone_verified" style="display:none;"><img src="' + base_url + '/img/check.png" alt="" style="vertical-align:bottom;"/> Numero di telefono verificato.</div>');
                break;
        };
        divFather.append(divPhoneVerified);
    },
    getLabel: function (htmlElem) {
        var sLabel = "";
        if (htmlElem.type != "boolean" && htmlElem.type != "tos" && htmlElem.type != "label") {
            var sLabel = htmlElem.label + "<br>";
        };
        if (htmlElem.optional == 1 && htmlElem.qs != 'phone_hidden' && htmlElem.qs != 'nosalesmen') {
            sLabel += "<span style=\"font-weight:normal;\">(facoltativo)</span>";
        };
        return sLabel;
    },
    createDomElem: function (element, elementValue, action) {
        var elementDom,
            divNodeRow,
            elementValueExist = !!elementValue.toString(),
            elementOptional = !!element.get('optional'),
            elementReadOnly = !!element.get('readonly'),
            elementToExclude = ['tos','accept_equal_opp','image'];
        elementDisabled = (elementReadOnly && ((elementOptional || elementValueExist) || (!elementOptional && elementValueExist) || element.qs === 'tos' || element.qs === 'accept_equal_opp'));

        if (elementDisabled && !elementValueExist && elementToExclude.indexOf(element.qs) === -1 ) {
            return false;
        }

        /*
         * @ToFix: If the field's validation  is changed and the field is readonly,
         * the user will be in a loop.
         * */
        switch (element.myElem) {
            case "input":
                switch (element.myType) {
                    case 'text':
                    case 'password':
                        if (elementDisabled) {
                            elementDom = this.createDisabledNode(element);
                        } else {
                            elementDom = this.createInputNode(element);
                        }
                        break;
                    case 'hidden':
                        elementDom = this.createHiddenNode(element);
                        divNodeRow = document.createElement('div');
                        divNodeRow.className = 'rowNode';
                        divNodeRow.appendChild(elementDom);
                        return divNodeRow;
                        break;
                    case 'radio':
                        if (elementDisabled) {
                            elementDom = this.createDisabledNode(element);
                        } else {
                            elementDom = this.createRadioNode(element);
                        }
                        break;
                    case 'checkbox':
                        elementDom = this.createCheckboxNode(element, elementDisabled, action);
                        break;
                    case 'imguploader':
                        if (AD.mainImage === null && elementDisabled) {
                            return false;
                        }
                        if (AIFORM.currentImageRow) {
                            this.currentMaxImages = element.max_images;
                            return AIFORM.currentImageRow;
                        }
                        elementDom = this.createInputImg(element, elementDisabled);
                        break;
                }
                break;
            case "select":
                if (elementDisabled) {
                    elementDom = this.createDisabledNode(element);
                } else {
                    elementDom = this.createSelectNode(element);
                }
                break;
            case "textarea":
                if (elementDisabled) {
                    elementDom = this.createDisabledNode(element);
                } else {
                    elementDom = this.createTextareaNode(element);
                }
                break;
            case "map":
                if (AIFORM.currentInputMap) {
                    return AIFORM.currentInputMap;
                }
                elementDom = this.createMapNode(element, elementDisabled);
                break;
            case "label":
                elementDom = this.createLabelNode(element);
                break;
        }

        var divNodeRow = $("<div class='rowNode optim-" + element.qs + "'></div>");
        switch (element.myType)
        {
            case 'imguploader':
                divNodeRow.attr('id', 'imguploadrow');
                break;
            case 'map':
                divNodeRow.attr('id', 'inputmaprow');
                break;
        }
        switch (element.qs) {
            case 'zone':
                divNodeRow.attr('id', 'zone');
                break;
        }
        sLabel = this.getLabel(element);

        var divNodeLabel = $('<label class="lfloat" for="'+element.qs+'" >' + sLabel + '</label>');
        var divNodeInput = $("<div class='boxInput lfloat'></div>");
        var divNodeError = $("<div class='error' id='error_field_" + element.qs + "'></div>");

        var divNodeTips = $("<div class='tooltip' id='tip_" + element.qs + "'></div>");
        divNodeInput.append(elementDom);

        if (element.qs == 'price') {
            var priceSpanClassName = 'lfloat',
                priceAfterContent;

            if (element.get('readonly') === '1') {
                priceSpanClassName += ' disabledField';
            }

            priceAfterContent = $('<span class="' + priceSpanClassName + '">,00 <strong>Euro</strong>');
            divNodeInput.append(priceAfterContent);
        }
        if (element.myElem == "label") {
            divNodeRow.append($('<label class="lfloat"></label>'));
            divNodeRow.append(divNodeInput);
            return divNodeRow;
        }
        divNodeInput.append(divNodeError);
        this.appendExtraElem(divNodeInput, elementDom.name);
        divNodeRow.append(divNodeLabel);
        divNodeRow.append(divNodeInput);
        divNodeRow.append(divNodeTips);

        return divNodeRow;
    },
    setImageUploaderInfo: function () {
        max_uploadable = this.currentMaxImages;
        file_index = 0;
        image_length = $("div.picture-placeholder-full").length;
        image_rim = (max_uploadable - image_length) > 0 ? (max_uploadable - image_length) : 0;
        previewPosition = image_length;
        max_in_a_row = (max_uploadable - previewPosition) >= 3 ? 3 : (max_uploadable - previewPosition);

        if (AD.mainImage != null) {
            max_in_a_row = 3;
            image_length = image_length + (AD.extraImages).length + 1;
            image_rim = (max_uploadable - image_length) > 0 ? (max_uploadable - image_length) : 0;
            file_index = image_length;
            previewPosition = image_length;
        };
        var item_pic = Array("dropbox");
        /*
         for (var i = 1; i < 3; i++) {
         item_pic[i] = "pict-placeholder-" + (i);
         };
         */

        for (var i = 0; i < item_pic.length; i++) {
            $("#" + item_pic[i]).hide();
        };

        if (max_uploadable > image_length) {
            y = max_in_a_row > (image_length - 1) ? max_in_a_row - (image_length - 1) : max_in_a_row - ((image_length - 1) % max_in_a_row);
            y = image_rim < y ? image_rim : y;
            for (var i = 0; i < y; i++) {
                $("#" + item_pic[i]).show();
            };
        };

        if (image_rim > 0) {
            $("span.remaining").show();
        } else {
            $("span.remaining").hide();
        };

        $("span#number").html(image_rim);
        $("span#mage-number").html(max_uploadable);
    },
    buildPaidOptions: function (toAppend, schema) {

        var nTotPaid = 0,
            categoryPrice = 0,
            paidoptionData,
            divContainerPO = $('<div class="paidOptions"></div>');

        // REMOVE ELEMENTS
        $('.paidOptions,#totalContainer,#paymentContainer').remove();

        if (AD.hasOwnProperty("category_price") && (AD.category_price[AD.values.type]) != "0") {
            sDesc = API.getDisplayValue("category", AD.values.category);
            categoryPrice = AD.category_price[AD.values.type].replace(",", "");

            paidoptionData = {
                qs: 'buy_catpay',
                categoryLabel: sDesc,
                categoryId: AD.values.category,
                value: categoryPrice,
                price: AD.category_price[AD.values.type]
            }

            divContainerPO.append(Mustache.render($('#tmpl_paidoption_list_catpay').text(), paidoptionData));
        }

        for (iter1 in schema.paid_options) {
            paidoptionData = schema.paid_options[iter1];

            for (i in paidoptionData.options) {
                // Format prices
                paidoptionData.options[i].price_to_string = (parseFloat(paidoptionData.options[i].price, 10) / 100).toFixed(2).replace('.', ',');

                if (typeof paidoptionData.options[i].price_original !== 'undefined') {
                    paidoptionData.options[i].price_original_to_string = (parseFloat(paidoptionData.options[i].price_original, 10) / 100).toFixed(2).replace('.', ',');
                }

                // Save option in AIFORM property
                AIFORM.paidOptionsMap[paidoptionData.options[i].value] = paidoptionData.options[i].label;
            }

            divContainerPO.append(Mustache.render($('#tmpl_paidoption_list').text(), paidoptionData));
        }

        toAppend.append(divContainerPO);
        divTotal = $("<div id='totalContainer'  ><div>Totale <strong><span id='nTotPaid'></span> &euro;<strong></div></div>");
        toAppend.append(divTotal);

        var paymentContainer = $("<div id='paymentContainer'></div>");
        var salesConditionContainer = $('<div class="lfloat salesCondition" ><span class="small"><input type="checkbox" checked="checked" id="terms_general"> Accetto le <a href="/selling_terms.htm" target="_blank"><strong>condizioni generali di vendita</strong></a>.</span></div>');
        var paymentContent = $("<div class='content'><h4 >Scegli il metodo di pagamento</h4></div>");
        var defaultPayment = false;
        for (iter1 in schema.payment_list) {
            var objPayment = schema.payment_list[iter1];
            if (objPayment.payment_type == "pp") {
                sImg = "ico_paypal_little.gif";
            } else {
                sImg = "ico_credit_card_little.gif";
            };
            if (objPayment.payment_method == "fast") {
                if (objPayment.label.indexOf("@") != -1) {
                    sLabel = "Il tuo account " + objPayment.label;

                } else {
                    switch (objPayment.cc_type) {

                        case "V":
                            sTypeCard = "La tua VISA";
                            break;
                        case "M":
                            sTypeCard = "La tua Mastercard";
                            break;
                        default:
                            sTypeCard = "";
                            break;
                    };
                    sLabel = sTypeCard + " che termina con &middot;&middot;&middot;&middot; &middot;&middot;&middot;&middot; &middot;&middot;&middot;&middot; " + objPayment.label;
                }
                defaultPayment = true;
                divPayBox = '<div class="methodbox">\
                                <div class="method_item" id="method_fast_' + objPayment.payment_type + '">\
                                    <label><input type="radio" id="radio_fast" name="payment_method" value="fast" checked="checked">' + sLabel + '</label>\
                                </div>\
                            </div>';

            } else {
                sLabel = objPayment.label;
                sChecked = (objPayment.payment_type == 'cc' && !defaultPayment) ? 'checked="checked"' : '';
                divPayBox = '<div class="methodbox">\
                                <div class="method_item" id="method_item_' + objPayment.payment_type + '">\
                                    <label><input type="radio" id="radio_std_' + objPayment.payment_type + '" name="payment_type" value="' + objPayment.payment_type + '" ' + sChecked + '>' + sLabel + '</label>\
                                </div>\
                            </div>';
            }

            paymentContent.append(divPayBox);
        };

        paymentContainer.append(paymentContent);
        paymentContainer.append('<span class="paymentMethods aiform-img-carte-di-credito"></span>');
        paymentContainer.append(salesConditionContainer);
        popOverInitButton();
        toAppend.append(paymentContainer);

        if ($('#radio_fast').length > 0) {
            $('#radio_fast').click(function () {
                AIFORM.switchPaymentMethod('fast');
                $(this).blur();
            });
        };

        $('input[name=payment_type]').click(function () {
            AIFORM.switchPaymentMethod('standard');
            $(this).blur();
        });

        nTotPaid += parseFloat(categoryPrice);
        if (!nTotPaid == 0) {
            sTotPaid = nTotPaid.toString();
            sTotPaid = sTotPaid.substr(0, sTotPaid.length - 2) + ',' + sTotPaid.substr(-2);
            $('#paymentContainer').show();
        } else {
            sTotPaid = '0';
            $('#paymentContainer').hide();
        };

        $('#nTotPaid').html(sTotPaid);
    },
    showInsert: function () {
        // DESTROY SLIDER
        if (AIFORM.slider !== null) {
            AIFORM.slider.destroySlider();
        }

        // HIDE OTHER ELEMENTS
        $('#btnConfirm').parent().hide();
        $('#aiPreview,#aiConfirm,#emailSent,#boxPreview,#more_visibility').hide();

        // SET TAB STEPS
        $('section > nav > ul > li').eq(1).removeClass('active');
        $('section > nav > ul > li').eq(2).removeClass('active');
        $('section > nav > ul > li').eq(0).addClass('active');

        $('#aiformTitleMobile h1').removeClass('active');
        $('#aiformTitleMobile .step1').addClass('active');

        // SHOW INSERT ELEMENTS
        $('#btnAiSubmit').parent().show();
        $('#aiInsert,#dynamicRules,#notice,#how_contact').show();

        switch(currentAction){
            case 'edit':
                $('#mainTitle').text('Modifica annuncio');
                break;
            case 'prolong':
                $('#mainTitle').text('Rinnova annuncio');
                break;
            default:
                $('#mainTitle').text('Inserisci annuncio');
                break;

        }

        // SET FILE_INDEX
        file_index = $('div.picture-placeholder-full,div.picture-placeholder-done').length;
    },
    showVerify: function () {
        // HIDE OTHER ELEMENTS
        $('.canvasContainer canvas').show();
        $('.progress_bar_wrapper').hide();


        $('#btnAiSubmit').parent().hide();
        $('#aiInsert,#aiConfirm,#emailSent,#dynamicRules,#notice,#how_contact').hide();

        // SET TAB STEPS
        $('section > nav > ul > li').eq(0).removeClass('active');
        $('section > nav > ul > li').eq(2).removeClass('active');
        $('section > nav > ul > li').eq(1).addClass('active');

        $('#aiformTitleMobile h1').removeClass('active');
        $('#aiformTitleMobile .step2').addClass('active');

        // SHOW PREVIEW ELEMENTS
        $("#aiPreview,#boxPreview,#more_visibility").show();
        $('#btnConfirm').parent().show();
        $("#mainTitle").text("Verifica annuncio");

        // TRACK XITI
        if (currentAction === 'edit' || currentAction === 'prolong') {
            trackXiti.track('new_'+currentAction+'::preview', '0', 1);
            tc_vars.env_template='new_'+currentAction+'::preview';
        } else {
            trackXiti.track('new_newad::preview', '0', 1);
            tc_vars.env_template="new_newad::preview";
        }



        $.ajaxSetup({
            cache: true
        });
        $.getScript(subito.configuration.getTcUrl(is_mobile));

    },
    switchPaymentMethod: function (pay_method_selected) {
        if (pay_method_selected == 'fast') {
            $('input[name=payment_type]').prop('checked', false);
        } else if ($('#radio_fast').length > 0) {
            $('#radio_fast').prop('checked', false);
        }
        $(this).blur();
    },
    refreshCaptcha: function () {
        if ($("#code_img").length > 0) {
            rand = Math.floor(Math.random() * (900 - 100) + 100);
            document.getElementById('code_img').src = document.getElementById('code_img').src.replace(/\m=([0-9]{3})/, 'm=' + rand);
            return false;
        }
    },
    focusOnFirstError: function (callback) {
        var firstErrorElement = $('.inputError').first();
        if (firstErrorElement.length > 0) {
            var offsetError = firstErrorElement.offset().top;
            $(window).scrollTop(offsetError - 40);
        }

        if (typeof callback === 'function') {
            callback();
        }
    }
};

var trackXiti = {
    xtsd: null,
    xtn2: null,
    xtsite: null,
    xtcount: {},

    init: function (callback) {
        if (this.xtsd === null || this.xtn2 === null || this.xtsite === null) {
            this.xtsd = xtsd;
            this.xtn2 = xtn2;
            this.xtsite = xtsite;
        }
        callback();
    },
    track: function (xtpage, xtdi, xtlimit) {
        var category = Number(AD.values.category) || 0;
        this.incrementCount(xtpage);
        if ((xtlimit > 0 && xtlimit >= this.xtcount[xtpage]) || xtlimit === 0 || typeof (xtlimit) === 'undefined') {
            this.init(function () {
                var urlXiti = this.xtsd + '.xiti.com/hit.xiti?s=' + this.xtsite + '&s2=' + this.xtn2 + '&p=' + xtpage + '&di=' + xtdi + '&x18=' + category + '&na=' + Math.floor((Math.random() * 100000) + 1);
                $('#xiti_tags').append('<img width="1" height="1" alt="" src="' + urlXiti + '"/>');
            });
        }
    },
    incrementCount: function (label) {
        if (typeof (this.xtcount[label]) === 'undefined') {
            this.xtcount[label] = 1;
        } else {
            //reset variable
            if (label === 'new_newad::form_1') {
                this.xtcount['new_newad::preview'] = 0;
            } else if (label === 'new_newad::preview') {
                this.xtcount['new_newad::form_1'] = 0;
            }
            this.xtcount[label]++;
        }
    }
};
function removeImageCallback(obj) {
    var fileList = document.getElementById('fileList');
    var switchMain = false;
    var switchClear = false;
    if ($(obj.parentElement.parentElement).hasClass('clear')) {
        switchClear = true;
    }
    if ($(obj.parentElement.parentElement).hasClass('main')) {
        switchMain = true;
    }
    $(obj.parentElement.parentElement).stop().fadeOut(400, function(e) {
        var next = obj.parentElement.parentElement.nextSibling;
        fileList.removeChild(obj.parentElement.parentElement);
        $('#preview').hide();
        nextRowManagerBackward(fileList);
        previewPosition--;
        if (switchMain === true) {
            if (previewPosition > 0) {
                $(fileList.firstElementChild).addClass('main');
                $(fileList.firstElementChild).removeClass('clear');
                if (fileList.children.length > 0) {
                    $(fileList.children[1]).addClass('clear');
                }
            } else {
                $(fileList).fadeOut(100, function() {
                    $(fileList).addClass('init');
                    $(fileList).removeClass('preview');
                    $(fileList).parent().removeClass('normal_border');
                    $(fileList).fadeIn();
                });
            }
        }
        if (switchClear === true) {
            if (fileList.children.length > 0) {
                $(fileList.children[1]).addClass('clear');
            }
        }
        resetErrorMessage();
    });
}

function removeImage(obj) {
    var n = $(obj).parent().parent().prevAll().length;
    AD.removeImage(n, obj, removeImageCallback);
}



function rotateImage(obj) {
    var obj = $(obj).parent().parent().children('img');
    var splitId = $(obj).attr('id').split('_');
    var id = splitId[1];
    var newOrientation = 0;
    var img = document.getElementById('image_' + id);

    new_size = resize(img.naturalWidth, img.naturalHeight, max_width, max_height);

    new_width = new_size[0];
    new_height = new_size[1];

    newOrientation = orientation_list[id];
    newOrientation = newOrientation + 1;

    if (newOrientation > 3)
        newOrientation = 0;

    orientation_list[id] = newOrientation;
    var canvas = document.getElementById("my_canvas_" + id);
    rotateCanvas(img, canvas, newOrientation, new_width, new_height, "small");
}


function sendImage(obj, base_name, canvasData, loadingCounter, callback) {
    var ajax = new XMLHttpRequest();
    ajax.upload.mainObj = obj;
    ajax.upload.counter = obj.counter;

    ajax.upload.onprogress = function(e) {
        if (!$(this.mainObj.removeButton).hasClass('hidden') || !$(this.mainObj.rotateButton).hasClass('hidden')) {
            $(this.mainObj.removeButton).addClass('hidden');
            $(this.mainObj.rotateButton).addClass('hidden');
        };
        var pc = parseInt(e.loaded / e.total * 100);
        var progress_bar = document.getElementById("progress_bar_" + this.mainObj.counter);
        progress_bar.style.display = 'block';
        var smallCanvas = document.getElementById("my_canvas_" + this.mainObj.counter);
        smallCanvas.style.display = "none";
        var bar = document.getElementById("progress_bar_bar_" + this.mainObj.counter);
        bar.style.width = pc + "%";
        obj.progressDone = true;
    };

    ajax.upload.onloadend = function(e) { // Preview reset
        // after upload
        // ended
        if (typeof obj.progressDone === 'undefined')
            this.onprogress({
                loaded: 100,
                total: 100
            });
        var progress_bar = document.getElementById('progress_bar_' + this.mainObj.counter);
        // progress_bar.style.display="none";
        var bar = document.getElementById('progress_bar_bar_' + this.mainObj.counter);
        bar.style.width = '100%';

        savedCount = 0;
        while (this.mainObj.children.length > savedCount) {
            if (this.mainObj.children.item(savedCount).tagName === 'IMG' || this.mainObj.children.item(savedCount).className === 'canvasContainer') {
                savedCount++;
            } else {
                this.mainObj.removeChild(this.mainObj.children.item(savedCount));
            }
        }

        var smallCanvas = document.getElementById('my_canvas_' + this.mainObj.counter);
        smallCanvas.style.display = 'none';

        this.mainObj.onupload = null;
        if ($(this.mainObj).hasClass("main")) {
            this.mainObj.className = "picture-placeholder-done medium main";
        } else {
            this.mainObj.className = "picture-placeholder-done medium";
        }
        $(this.mainObj).append('<div class="icons_container"><div class="remove"></div></div>');
        $(this.mainObj).droppable('option', 'disabled', true);

        var oldMouseOver = this.mainObj.onmouseover;
        this.mainObj.onmouseover = function(e) {
            oldMouseOver({
                counter: obj.counter
            });
            var progress_bar = document.getElementById("progress_bar_" + obj.counter);
            progress_bar.style.display = "none";
            var smallCanvas = document.getElementById("my_canvas_" + obj.counter);
            smallCanvas.style.display = "";
        };

        var oldMouseOut = this.mainObj.onmouseout;
        this.mainObj.onmouseout = function(e) {
            oldMouseOut({
                toElement: this.mainObj
            });
            var smallCanvas = document.getElementById("my_canvas_" + obj.counter);
            var progress_bar = document.getElementById("progress_bar_" + obj.counter);
        };
    };

    category = AD.getField("category");
    categoryParam = "";
    if (category) {
        categoryParam = "?category=" + category;
    }
    ajax.open("POST", "/api/v5/aij/addimage/0" + categoryParam, true);
    ajax.setRequestHeader("X_FILENAME", base_name + ".jpg");
    var mainObjCounter = obj.counter;
    ajax.onreadystatechange = function(e) {
        if (ajax.readyState == ajax.DONE) {
            jsonResponse = JSON.parse(ajax.response);
            if (jsonResponse.status === 'OK') {
                AD.addImage(base_name, jsonResponse.image_name);
                //window.count = uploadAvaibleImage( window.count,callback );
                uploadAvaibleImage(window.count, callback);
            } else {
                jQuery("#progress_bar_bar_" + mainObjCounter).addClass("failed");
                jQuery.each(jsonResponse.errors, function(err_key, message_text) {
                    showErrorMessage(err_key, {
                        message: message_text
                    });
                });
                $.unblockUI();
            }
        }
    };

    ajax.send(canvasData);

}

function uploadAvaibleImage(loadingCounter, callback) {
    var privateCount = 0;
    if (typeof(fileList) != 'undefined') {
        var lengthChildren = $(fileList).children('.picture-placeholder-full').length;
        if (lengthChildren > 0) {
            for (var i = (loadingCounter); i < fileList.children.length; i++) {
                if (typeof fileList.children[i].onupload == "function") {
                    if (AD.mainImage !== null && !AD.getField('category')) {
                        showErrorMessage('extra_image', {
                            message: 'Seleziona una categoria per poter aggiungere altre immagini'
                        });
                        return loadingCounter;
                    }
                    fileList.children[i].onupload(callback);
                    privateCount++;
                    window.count++;
                    break;
                };
            };
        }
    };
    if (privateCount == 0) {
        callback();
    };

    //return window.count;
};

function resize(original_width, original_height, resize_width, resize_height) {
    var height_scale = resize_height / original_height;
    var width_scale = resize_width / original_width;

    var scale = 1;

    if (height_scale < width_scale) {
        scale = height_scale;
    } else {
        scale = width_scale;
    };


    if (scale < 1) {
        new_height = parseInt(original_height * scale);
        new_width = parseInt(original_width * scale);
    } else {
        new_height = original_height;
        new_width = original_width;
    };


    return (Array(new_width, new_height));
};

function orientationChange(newOrientation, new_width, new_height, width_limit, height_limit) {
    switch (newOrientation) {
        case 0: // Original position
            if (new_width > new_height && Math.round(new_height * width_limit / new_width) <= height_limit) {
                new_height = Math.round(new_height * width_limit / new_width);
                new_width = width_limit;
            } else if (new_width < new_height && Math.round(new_width * height_limit / new_height) <= width_limit) {
                new_width = Math.round(new_width * height_limit / new_height);
                new_height = height_limit;
            };
            canvas_height = new_height;
            canvas_width = new_width;
            translation_x = 0;
            translation_y = 0;
            rotation = 0;

            break;

        case 2: // 180°
            if (new_width > new_height && Math.round(new_height * width_limit / new_width) <= height_limit) {
                new_height = Math.round(new_height * width_limit / new_width);
                new_width = width_limit;
            } else if (new_width < new_height && Math.round(new_width * height_limit / new_height) <= width_limit) {
                new_width = Math.round(new_width * height_limit / new_height);
                new_height = height_limit;
            };
            canvas_height = new_height;
            canvas_width = new_width;
            translation_x = new_width / 2;
            translation_y = new_height / 2;
            rotation = Math.PI;

            break;

        case 1: // 90°
            if (new_width > new_height && Math.round(new_height * height_limit / new_width) <= width_limit) {
                new_height = Math.round(new_height * height_limit / new_width);
                new_width = height_limit;
            } else if (new_width < new_height && Math.round(new_width * width_limit / new_height) <= height_limit) {
                new_width = Math.round(new_width * width_limit / new_height);
                new_height = width_limit;
            };
            canvas_height = new_width;
            canvas_width = new_height;
            translation_x = new_height / 2;
            translation_y = new_height / 2;
            rotation = Math.PI / 2;

            break;

        case 3: // 270°
            if (new_width > new_height && Math.round(new_height * height_limit / new_width) <= width_limit) {
                new_height = Math.round(new_height * height_limit / new_width);
                new_width = height_limit;
            } else if (new_width < new_height && Math.round(new_width * width_limit / new_height) <= height_limit) {
                new_width = Math.round(new_width * width_limit / new_height);
                new_height = width_limit;
            };
            canvas_height = new_width;
            canvas_width = new_height;
            translation_x = new_width / 2;
            translation_y = new_width / 2;
            rotation = (3 * Math.PI) / 2;

            break;
    };

    return {
        n_height: new_height,
        n_width: new_width,
        height: canvas_height,
        width: canvas_width,
        tran_x: translation_x,
        tran_y: translation_y,
        rot: rotation
    };
};

function rotateCanvas(img, canvas, newOrientation, new_width, new_height, thumbnail) {
    if (typeof thumbnail == 'undefined') {
        thumbnail = false;
    };
    switch (thumbnail) {
        case "small":
            var width_limit = max_width;
            var height_limit = max_height;
            break;
        case "big":
            var width_limit = preview_width;
            var height_limit = preview_height;
            break;
    };

    var rot_values = orientationChange(newOrientation, new_width, new_height, width_limit, height_limit);
    new_height = rot_values.n_height;
    new_width = rot_values.n_width;
    canvas_height = rot_values.height;
    canvas_width = rot_values.width;
    translation_x = rot_values.tran_x;
    translation_y = rot_values.tran_y;
    rotation = rot_values.rot;

    canvas.width = canvas_width;
    canvas.height = canvas_height;

    if (thumbnail) {
        if (canvas.height < height_limit) {
            canvas.style.marginTop = (height_limit - canvas.height) / 2;
        } else {
            canvas.style.marginTop = 0;
        };
    };

    var context = canvas.getContext('2d');

    // rotating the canvas
    context.translate(translation_x, translation_y);
    context.rotate(rotation);
    context.translate(-translation_x, -translation_y);
    context.drawImage(img, 0, 0, new_width, new_height);
};


function handleFiles(files) {
    resetErrorMessage();
    enableLoadingStatus();

    if (files.length > 0) {
        var test_img = null;
        var img_height = 2000;
        var img_width = 3552;
        var limit = max_uploadable - previewPosition;
        window.loadingCounter = 0;
        var dontCountme = 0;

        function loadNextImage(files) {

            function goForward(success) {
                window.loadingCounter++;
                if (success == true) {
                    files_list[file_index] = files[i];
                    file_index = file_index + 1;
                } else {
                    dontCountme++;
                };
                setTimeout(function() {
                    loadNextImage(files);
                }, 200);
            };

            var i = window.loadingCounter;
            if (i < files.length && i - dontCountme < limit) { // Limit to maximum uploadable
                // files
                if (["image/jpeg", "image/png", "image/gif"].indexOf(files[i].type) == -1) {
                    showErrorMessage("format");
                    goForward();
                    return;
                };

                var img = document.createElement("img");
                img.id = "image_" + file_index;
                img.counter = file_index;
                img.style.display = "none";

                img.src = window.URL.createObjectURL(files[i]);
                img.filename = files[i].name;

                img.onload = function(e) {
                    var max = Math.max(this.width, this.height);
                    var min = Math.min(this.width, this.height);
                    if (max < 250 || min < 100) {
                        showErrorMessage("dimension", {
                            filename: this.filename
                        });
                        goForward();
                        return;
                    };

                    if ($(dropbox).hasClass("init")) { // Shows image previews
                        // if before hidden
                        $(fileList).fadeOut(200, function() {
                            $(dropbox).removeClass("init");
                            $(dropbox).addClass("preview");
                            $(dropbox).parent().addClass("normal_border");
                            enableLoadingStatus();
                            $(fileList).stop(true).fadeIn();
                        });
                    };

                    var li = document.createElement("div"); // Creates the list
                    // element
                    li.className = "picture-placeholder-full";
                    li.counter = this.counter;
                    window.playImg = this;

                    if (previewPosition == 0) {
                        li.classList.add("main");
                    } else if (previewPosition == 1) {
                        li.classList.add("clear");
                    };

                    li.style.display = "none";
                    li.appendChild(this);

                    if (files.length <= 2) {
                        $(li).fadeIn();
                    } else {
                        li.style.display = "";
                    };

                    enableLoadingStatus();
                    fileList.insertBefore(li, fileList.children[previewPosition]);
                    nextRowManagerForward(fileList, files.length >= 2);
                    previewPosition++;

                    window.URL.revokeObjectURL(this.src);

                    img_height = this.naturalHeight;
                    img_width = this.naturalWidth;

                    newOrientation = 0;
                    orientation_list[this.counter] = newOrientation;

                    var canvas_container = document.createElement("div");
                    canvas_container.className = "canvasContainer";

                    var canvas = document.createElement("canvas");
                    canvas.id = "my_canvas_" + this.counter;

                    li.onmouseover = function(e) {
                        // Prevents preview appearance on loaded images
                        if ($(li).hasClass("picture-placeholder-done")) {
                            return;
                        };

                        // Identifies current image
                        if (typeof e.counter != 'undefined') {
                            currentCounter = e.counter;
                        } else {
                            currentCounter = this.counter;
                        };
                        var previewCanvas = document.createElement("canvas");
                        var img = document.getElementById("image_" + currentCounter);
                        var smallCanvas = document.getElementById("my_canvas_" + currentCounter);

                        newOrientation = orientation_list[currentCounter];
                        new_size = resize(img.naturalWidth, img.naturalHeight, preview_width, preview_height);

                        new_width = new_size[0];
                        new_height = new_size[1];

                        // Reloads the rotation change in the big preview
                        rotateCanvas(img, previewCanvas, newOrientation, new_width, new_height, "big");

                        var previewContainer = document.getElementById("preview");
                        previewContainer.innerHTML = "";
                        previewContainer.appendChild(previewCanvas);
                        // Riposizionamento box preview
                        var image_position = $(this).prevAll().filter(".picture-placeholder-full").length;
                        var extra_space = 15;
                        if (image_position < max_in_a_row + 1) {
                            extra_space = 32;
                        };
                        previewContainer.style.top = ($(this).offset().top+35 ) + "px";
                        if ($("#preview").css("display") == "none" && $(previewContainer).html() != "") {
                            $(previewContainer).stop(true).fadeIn();
                        };
                    };

                    li.onmouseout = function(event) { // Hides the big preview
                        if (event == null) {
                            return;
                        }
                        var bypassCheck = false;
                        var e = event.toElement || event.relatedTarget;
                        if (e == null) {
                            bypassCheck = true;
                        };
                        if (!bypassCheck) {
                            if (e.parentNode == this || e.parentNode.parentNode == this || e == this) {
                                return;
                            };
                        };
                        var previewContainer = document.getElementById("preview");
                        $(previewContainer).stop(true).hide();
                        previewContainer.innerHTML = "";
                    };

                    new_size = resize(img_width, img_height, max_width, max_height);

                    new_width = new_size[0];
                    new_height = new_size[1];

                    rotateCanvas(this, canvas, newOrientation, new_width, new_height, "small");
                    canvas_container.appendChild(canvas);

                    li.appendChild(canvas_container); /* Create Container */
                    var icons_container = document.createElement('div');
                    icons_container.className = "icons_container";

                    li.appendChild(icons_container);
                    var button = document.createElement("div");
                    button.className = "rotate";
                    button.counter = this.counter;

                    icons_container.appendChild(button);
                    li.rotateButton = button;

                    li.onupload = function(callback, e) {
                        var filename = files_list[this.counter].name;

                        // File naming for uploaded files
                        if ($(this).hasClass("main")) {
                            filename = "MAIN__" + filename;
                        } else {
                            var image_position = $(this).prevAll().filter(".picture-placeholder-full").length + $(this).prevAll().filter(".picture-placeholder-done").length;
                            filename = "N" + image_position + "__" + filename;
                        };

                        var base_name = filename.substr(0, filename.lastIndexOf('.'));
                        var originalCanvas = document.createElement("canvas");
                        var img = document.getElementById("image_" + this.counter);
                        var newOrientation = orientation_list[this.counter];

                        new_canvas_size = resize(img.naturalWidth, img.naturalHeight, upload_width, upload_height);
                        new_canvas_width = new_canvas_size[0];
                        new_canvas_height = new_canvas_size[1];
                        rotateCanvas(img, originalCanvas, newOrientation, new_canvas_width, new_canvas_height);

                        var canvasData = originalCanvas.toDataURL("image/jpeg", upload_image_quality);
                        var that = this;

                        if (canvasData.length > 0) {
                            sendImage(that, base_name, canvasData, i, callback);
                        }
                    };

                    var button3 = document.createElement("div");
                    button3.className = "remove";
                    button3.counter = this.counter;

                    icons_container.appendChild(button3);
                    li.removeButton = button3;

                    var progressBarWrapper = document.createElement("div");

                    progressBarWrapper.className = "progress_bar_wrapper";

                    var progressBar = document.createElement("div");
                    progressBar.className = "progress_bar";
                    progressBar.id = "progress_bar_" + this.counter;
                    progressBarWrapper.appendChild(progressBar);

                    var progressBar_bar = document.createElement("div");
                    progressBar_bar.className = "progress_bar_bar";
                    progressBar_bar.id = "progress_bar_bar_" + this.counter;
                    progressBar.appendChild(progressBar_bar);

                    canvas_container.appendChild(progressBarWrapper);

                    updateDraggable();
                    setTimeout(function() {
                        disableLoadingStatus();
                    }, 250 * files.length);
                    goForward(true);
                };
            } else {
                if (i < files.length) {
                    showErrorMessage("max-n", {
                        maxImages: max_uploadable
                    });
                };
                setTimeout(function() {
                    disableLoadingStatus();
                }, 250 * files.length);
            };
        };

        loadNextImage(files);
    };
};

function nextRowManagerForward(fileList, noFade) {
    // Manages objects showing/hiding when adding images
    enableLoadingStatus();
    if (previewPosition >= max_uploadable - 1) {
        $('#dropbox').css('display', 'none');
    } else {
        $('#dropbox').css('display', 'block');
    }
    var remaining = max_uploadable - previewPosition - 1;
    updateRemaining(remaining);
};

function nextRowManagerBackward(fileList) {
    // Manages objects showing/hiding when removing images
    switch ((previewPosition - 1) % max_in_a_row) {
        case 0:
            if (previewPosition - 1 >= max_in_a_row) {
                $("#dropbox.picture-placeholder")[0].style.display = "none";
                $("#dropbox.picture-placeholder").fadeIn();
                var newHeight = 256 + 105 * (Math.ceil((previewPosition - 1) / max_in_a_row) - 1);
                var newHeight = "auto";
                $(fileList).animate({
                    height: newHeight
                });
                if ($(fileList).hasClass("loading")) {
                    enableLoadingStatus({
                        animate: true,
                        height: newHeight + $(fileList).outerHeight(true) - $(fileList).height()
                    });
                };
            };
            break;
        default:
            var invisible_ph = $("#fileList .picture-placeholder").filter(function() {
                return $(this).css('display') == 'none';
            });
            $(invisible_ph[0]).fadeIn();
    };
    var remaining = max_uploadable - previewPosition + 1;
    updateRemaining(remaining);
};


function clickinit() {
    for (var i = 0; i < fileList.classList.length; i++) {
        if (fileList.classList[i] == 'init') {
            var fileElem = document.getElementById("fileElem");
            fileElem.click();
        }
    }
};

function clickinit2() {
    var fileElem = document.getElementById("fileElem");
    fileElem.click();
};

function dragenter(e) {
    e.stopPropagation();
    e.preventDefault();
};

function dragleave(e) {
    var target = $(e.target);
    target.removeClass("hover");
    e.stopPropagation();
    e.preventDefault();
};

function dragleavecontinue(e) {
    var target = $("#fileList");
    if (target.hasClass("hover") == true) {
        target.removeClass("hover");
    };
};

function dragover(e) {
    var target = $(e.target);
    target.addClass("hover");
    e.stopPropagation();
    e.preventDefault();
};

function dragovercontinue(e) {
    var target = $("#fileList");
    if (target.hasClass("hover") == false) {
        target.addClass("hover");
    };
};

function drop(e) {
    var target = $(e.target);
    var dropbox = $("#fileList");
    dropbox.removeClass("hover");
    if (target.hasClass("picture-placeholder-full") || target.hasClass("picture-placeholder-done") || target.hasClass("placeholder-after-main")) {
        return;
    };

    if (e.dataTransfer.files.length == 0)
        return;

    e.stopPropagation();
    e.preventDefault();

    if ($(dropbox).hasClass("off")) {
        return;
    };

    var dt = e.dataTransfer;
    var files = dt.files;

    handleFiles(files);
};

function droperror(e) {
    e.stopPropagation();
    e.preventDefault();
    // alert("Attenzione! Trascinare le immagini nell'area apposita della
    // pagina.");
};

function uploadAll(callback) {
    resetErrorMessage();
    if (typeof(AD.extraImages) == 'undefined') {
        var image_uploaded = (AD.mainImage != null ? 1 : 0) + $("div.picture-placeholder-full").length;
    } else {
        var image_uploaded = (AD.extraImages.length + (AD.mainImage != null ? 1 : 0) + $("div.picture-placeholder-full").length);
    }
    if (image_uploaded <= max_uploadable) {
        window.count = 0;
        uploadAvaibleImage(0, callback);
    } else {
        showErrorMessage('extra_image', {
            message: 'Hai troppe immagini per questa categoria'
        });
    };
};

function showErrorMessage(type, options) {
    if (typeof options == 'undefined') {
        options = {};
    };
    switch (type) {
        case "dimension":
            if ($("#error-messages #message." + type)[0].style.display != "none") {
                $("#error-messages #message." + type).fadeOut();
                $("#error-messages #message." + type + "-multi").fadeIn();
            } else if (options.filename != "" && options.filename != null && $("#error-messages #message." + type + "-multi")[0].style.display == "none") {
                $("#error-messages #message." + type + " #filename").html("(" + options.filename + ")");
                $("#error-messages").show();
                $("#error-messages #message." + type).fadeIn();
            };
            break;
        case "max-n":
            $("#error-messages #message." + type + " #image-number").html(options.maxImages);
        case "format":
            $("#error-messages").show();
            $("#error-messages #message." + type).fadeIn();
        default:
            if (typeof options.message != 'undefined' && options.message != "") {
                var errElem = $("#error-messages").find("#message." + type);
                if ($(errElem).length <= 0) {
                    errElem = $("<div id='message' class='" + type + "'>" + options.message + "</div>");
                    $("#error-messages").append(errElem);
                }
                $(errElem).fadeIn();
                $("#error-messages").show();
            }
    };
};

function resetErrorMessage() {
    $("#error-messages").hide();
    $("#error-messages #message").hide();
};

function updateRemaining(remaining) {
    if (remaining == 0) {
        $("#body-content #title.other-pictures .remaining").hide();
    } else {
        $("#body-content #title.other-pictures .remaining").show();
        $("#body-content #title.other-pictures .remaining #number").html(remaining);
        $("#body-content #title.other-pictures .remaining #subject").html(((remaining > 1) ? "immagini" : "immagine"));
    };
};

function updateDraggable() {
    $(".picture-placeholder-full").draggable({
        revert: true,
        revertDuration: 200,
        scope: "subitoImg",
        opacity: 0.5,
        zIndex: 100,
        helper: function() {
            var clone = $(this).clone(true);
            var destCtx = clone.find("canvas")[0].getContext('2d');
            destCtx.drawImage($(this).find("canvas")[0], 0, 0);
            $(this).parent().append('<div class="picture-placeholder-full empty" style="display:none"></div>');
            return clone;
        },
        start: function(event, ui) {
            $(this).draggable("option", "revert", true);
            var mainPlaceholder = $('<div></div>');
            mainPlaceholder.addClass("placeholder-after-main");
            mainPlaceholder.insertAfter($($(".picture-placeholder-full.main")[0]));

            $("#fileList").addClass("drag");
            $("#preview").addClass("drag");
            $(".picture-placeholder-full.empty").css({
                display: 'block',
                top: $(this).offset().top,
                left: $(this).offset().left
            });
            $(".picture-placeholder-full.empty").droppable({
                scope: "subitoImg",
                accept: ".picture-placeholder-full",
                hoverClass: "dropHover"
            });
            $(".placeholder-after-main").droppable({
                scope: "subitoImg",
                accept: ".picture-placeholder-full",
                over: function(event, ui) {
                    var main = $($(".picture-placeholder-full.main")[0]);
                    main.addClass("dropHover");
                },
                out: function(event, ui) {
                    var main = $($(".picture-placeholder-full.main")[0]);
                    main.removeClass("dropHover");
                },
                drop: function(event, ui) {
                    console.log($(this));
                    if ($(ui.draggable).hasClass("main") == false) {
                        $(ui.draggable).draggable("option", "revert", false);
                        var main = $(".picture-placeholder-full.main")[0];
                        if (ui.draggable.nextAll().filter($(main)).length == 0) {
                            ui.draggable.insertBefore($(main));
                        } else {
                            ui.draggable.insertAfter($(main));
                        };
                    };
                }
            });
        },
        stop: function(event, ui) {
            $("#fileList").children('.picture-placeholder-full, .picture-placeholder-done').removeClass("clear");
            $("#fileList").children('.picture-placeholder-full, .picture-placeholder-done').removeClass("main");
            $('#fileList').children('.picture-placeholder-full, .picture-placeholder-done').first().addClass("main");
            if ($('#fileList').children('.picture-placeholder-full, .picture-placeholder-done').length > 0) {
                $('#fileList').children('.picture-placeholder-full, .picture-placeholder-done').eq(1).addClass("clear");
            }

            $("#fileList").removeClass("drag");
            $(".dragged").removeClass("dragged");
            $(".dropHover").removeClass("dropHover");
            $(".picture-placeholder-full.empty").remove();
            $(".placeholder-after-main").remove();
            $("#preview").removeClass("drag");
        }
    });

    $(".picture-placeholder-full").droppable({
        scope: "subitoImg",
        accept: ".picture-placeholder-full",
        hoverClass: "dropHover",
        tolerance: "intersect",
        drop: function(event, ui) {
            $(ui.draggable).draggable("option", "revert", false);
            if ($(this).hasClass("main")) {
                $(this).removeClass("main");
                ui.draggable.addClass("main");
            } else if (ui.draggable.hasClass("main")) {
                ui.draggable.nextAll().filter(".picture-placeholder-full").first().addClass("main");
                ui.draggable.removeClass("main");
            };
            //REMOVE ALL CLEAR AND SET FIRST ELEMENT CLEAR
            if (ui.draggable.nextAll().filter($(this)).length == 0) {
                ui.draggable.insertBefore($(this));
            } else {
                ui.draggable.insertAfter($(this));
            };
            ui.draggable[0].onmouseover({
                toElement: ui.draggable
            });
        }
    });
}

function enableLoadingStatus(opts) {
    if (typeof opts == 'undefined') {
        opts = {};
    };
    if (typeof opts.height != 'undefined') {
        var newHeight = opts.height;
    } else {
        var newHeight = $("#fileList").outerHeight(true);
    };
    if (opts.animate == true) {
        $("#loading-content").stop(true).animate({
            height: newHeight
        });
    } else {
        $("#loading-content").stop(true).css({
            height: newHeight
        });
    };
    $("#fileList").addClass("loading");
};

function disableLoadingStatus() {
    $("#fileList").removeClass("loading");
};
if (typeof console === 'undefined' || typeof console.log === 'undefined') {
    console = {};
}

var objCat = {
    adCategory: '0',
    JSONMappedCategory: {},
    JSONTooltips: {},
    JSONRules: {},
    JSONCitesSuspiciusAnimals: ['Canis lupus', 'Lupo', 'Parnassius apollo', 'Parnassio'],
    boxRules : [ "L'annuncio sarà pubblicato se rispetta le regole di Subito.", "Non inserire più volte lo stesso annuncio." ],

    getRemoteTooltips: function(c, t) {
        $.ajax({
            url: '/aiinfo/?action=ttip',
            type: 'GET',
            data: {
                category: c,
                type: t
            },
            headers: {
                'Accept': 'application/json'
            },
            success: function(data) {
                objCat.JSONTooltips = data;
                objCat.populateTooltips(t);
            }
        });
    },
    getRemoteCatRules: function(ad_status) {
        $.ajax({
            url: '/aiinfo/?action=rule&ad_status=' + ad_status,
            type: 'GET',
            data: '',
            headers: {
                'Accept': 'application/json'
            },
            success: function(data) {
                objCat.JSONRules = data;
                objCat.drawRules();
            }
        });
    },
    getRemoteCitesAnimals: function() {
        $.ajax({
            url: '/aiinfo/?action=suspicious_list&category=23',
            type: 'GET',
            data: '',
            headers: {
                'Accept': 'application/json'
            },
            success: function(data) {
                objCat.JSONCitesSuspiciusAnimals = data;
                objCat.normalizeSupiciusAnimals();
                objCat.citesSearching($('[name="subject"]').val(), $('[name="body"]').val());
            }
        });
    },
    getRemoteCategoryMap: function() {

        $.ajax({
            url: '/aiinfo/?action=map',
            type: 'GET',
            data: '',
            headers: {
                'Accept': 'application/json'
            },
            success: function(data, textStatus, jqXHR) {
                objCat.JSONMappedCategory = data;
                objCat.JSONMappedCategory.c0 = '0';
            }
        });
    },
    extractTooltips: function(sType) {
        var ttips = this.JSONTooltips[sType]['c' + this.adCategory];

        if (typeof ttips !== 'undefined') {
            this.objTips = ttips;
        } else {
            this.objTips = this.JSONTooltips[sType].c0;
        }
    },
    populateTooltips: function(type) {
        var baseUrl = base_url;
        this.extractTooltips(type);
        $.each(this.objTips, function(key, value) {
            $('#tip_' + key).html('<div><img class="arrow" src="' + baseUrl + '/img2/tip_smooth_arrow_bg_white.png" />' + value + '</div>');
        });

    },
    getRules: function() {
        var nMappedRule = this.JSONMappedCategory['c' + this.adCategory];
        if (this.JSONRules['c' + nMappedRule]) {
            this.boxRules = this.JSONRules['c' + nMappedRule];
        }
    },
    cleanRules: function() {
        while (this.domDynamicRules.firstChild) {
            this.domDynamicRules.removeChild(this.domDynamicRules.firstChild);
        }
        var eleH2 = document.createElement('h2');
        eleH2.textContent = 'Ricorda che...';
        this.domDynamicRules.appendChild(eleH2);
    },
    drawRules: function() {
        'use strict';
        var eleUL,
            eleLI;
        if (this.domDynamicRules) {
            this.cleanRules();
            this.getRules();
            eleUL = document.createElement('ul');
            for (var i = 0; i < this.boxRules.length; i += 1) {
                eleLI = document.createElement('li');
                eleLI.innerHTML = this.boxRules[i];
                eleUL.appendChild(eleLI);
            }
            eleLI = document.createElement('li');
            eleLI.innerHTML = '<br><a href="https://assistenza.subito.it/hc/it/categories/200854199-Regole" style="text-decoration:none;" target="blank"><button class="btn_sec btn_small">Regole</button></a>';
            eleUL.appendChild(eleLI);
            this.domDynamicRules.appendChild(eleUL);
        }
    },
    normalizeSupiciusAnimals: function() {

        for (var k in this.JSONCitesSuspiciusAnimals) {
            if (this.JSONCitesSuspiciusAnimals.hasOwnProperty(k)) {
                var vList = this.JSONCitesSuspiciusAnimals[k].replace(new RegExp('\'', 'g'), ' ').split(' ');
                for (var item in vList) {
                    if (vList[item] === '') {
                        vList.splice(item);
                    }
                }
                this.JSONCitesSuspiciusAnimals[k] = vList;
            }
        }
    },
    findAnimal: function(txtElem) {
        if (txtElem !== '') {
            for (var i in this.JSONCitesSuspiciusAnimals) {
                if (this.JSONCitesSuspiciusAnimals.hasOwnProperty(i)) {

                    var nFound = 0;
                    var nCheck = this.JSONCitesSuspiciusAnimals[i].length;
                    for (var k in this.JSONCitesSuspiciusAnimals[i]) {
                        if (this.JSONCitesSuspiciusAnimals[i].hasOwnProperty(k)) {

                            var animal = this.JSONCitesSuspiciusAnimals[i][k];
                            var mySearch = new RegExp('\\b' + animal + '\\b', 'gi');
                            if (mySearch.test(txtElem)) {
                                nFound += 1;
                                if (nFound === nCheck) {
                                    return true;
                                }
                            }
                        }
                    }
                }
            }
        }
        return false;
    },
    citesSearching: function(textSubjectValue, textBodyValue) {
        'use strict';
        if (this.adCategory === 23 && (this.findAnimal(textSubjectValue) || this.findAnimal(textBodyValue))) {
            $('.cites_section').css('display', 'inline-block');
        } else {
            $('.cites_section').css('display', 'none');
            $('#cites_cert_numb,#cites_cert_from,#cites_cert_date').val('');
        }
    },
    init: function(adCategory, type, adStatus) {
        'use strict';
        this.adCategory = adCategory;
        this.domDynamicRules = document.getElementById('dynamicRules');
        this.getRemoteCategoryMap();
        this.getRemoteCatRules(adStatus);
        this.getRemoteTooltips(adCategory, type);
        if (adCategory === 23) {
            this.getRemoteCitesAnimals();
        }
    }
};
var dCacheDate = new Date(),
    sCacheYear = dCacheDate.getFullYear(),
    sCacheMonth = (dCacheDate.getMonth() + 1) > 9 ? dCacheDate.getMonth() + 1 + '' : '0' + (dCacheDate.getMonth() + 1),
    sCacheDay = (dCacheDate.getUTCDate()) > 9 ? dCacheDate.getUTCDate() + '' : '0' + (dCacheDate.getUTCDate()),
    sCacheDate = sCacheYear + sCacheMonth + sCacheDay;


function objFromCookie(sCookieName) {
    'use strict';
    var myObj;
    try {
        myObj = JSON.parse(decodeURIComponent(getCookie(sCookieName)));
    } catch (sErr) {
        //console.log(sErr);
    }
    if (!myObj) {
        myObj = {};
    }
    myObj.get = function(sField) {
        if (typeof(myObj) === 'object' && myObj.hasOwnProperty(sField)) {
            return myObj[sField];
        } else {
            return '';
        }
    };
    return myObj;

}

function updatePaidoptionCart(categoryPrice) {
    'use strict';

    var amount = categoryPrice || 0,
        $amountElement = $('#nTotPaid'),
        $elementContainerToToggle = $('#paymentContainer'),
        $totalPaidoptionChecked = $('.POOpt input[type="radio"]:checked');

    $.each($totalPaidoptionChecked, function(i, element) {
        amount += parseFloat($(element).attr('myprice'));
    });

    if (amount === 0) {
        $elementContainerToToggle.hide();
    } else {
        amount = (amount / 100).toFixed(2).replace('.', ',');
        $elementContainerToToggle.show();
    }

    $amountElement.html(amount);
}

$(document).ready(function() {
    $('body').delegate('.closeMSG', 'click', function(e) {
        Message.hide();
    });

    var api_timeout = 20000;
    window.api_error = false;
    window.ui_blocked = false;
    window.form_ready = false;

    if (typeof(is_regress) !== 'undefined' && getCookie('test_timeout') === 'subito.it') {
        api_timeout = 100;
    }
    $.ajaxSetup({
        beforeSend: function(jqXHR, settings) {
            // Only API requests
            if (settings.url.match(/^\/api\//i) !== null) {
                settings.timeout = api_timeout;
            }
        }
    });

    $(document).ajaxStart(function() {
        ajaxOngoing = true;
    });
    $(document).ajaxStop(function() {
        ajaxOngoing = false;
        if (!window.api_error) {
            Message.hide();
        }
        window.form_ready = true;
    });

    $(document).ajaxSend(function() {
        setTimeout(function() {
            if (ajaxOngoing && !api_error && !window.ui_blocked) {
                Message.show('Attendere...', 'loading');
            }
        }, 1000);
    });
    $(document).ajaxError(function(evento, ajqxhr, settings) {
        Message.error(evento, ajqxhr, settings);
    });
    if (typeof(is_mobile) === 'undefined') {
        is_mobile = false;
    }


    history.pushState('', document.title, window.location.pathname + window.location.search);

    API.init(jsonConfiguration, currentAction, function(session) {

        var objCookie,
            sessionAd = session.ad,
            paidOptionEnabled = [],
            sRememberedEmail = '';


        if (Object.keys(sessionAd).length === 1) {

            objCookie = objFromCookie('aidata');
            sRememberedEmail = objCookie.get('email');
        }

        if (currentAction === 'new') {
            if (Account.email) {
                sRememberedEmail = Account.email;
            }
            sessionAd.email = sRememberedEmail;
        }


        // POPOLAMENTO AD con dati in sessione


        AD.fillDataWithObject(sessionAd);

        AIUSER.init();
        API.getFields(AD, AIFORM.buildForm);

        $("form#aiform").delegate("select[name='category'],input[name='type'],input[name='company_ad']", "change", function(e) {
            //Message.show("Attendere...", "loading");
            window.form_ready = false;
            e.preventDefault();
            AD.setField(this.name, this.value);
            if (this.name === 'type') {
                API.resetLocationDetails(AD);
            }
            API.getFields(AD, AIFORM.buildForm);
        });

        $("#nextFoto,#prevFoto").click(function() {
            var nStep = 648,
                nTime = parseInt(($(".singleImage").length / 6)),
                nPos = parseInt($("#slideGallery").css("left").replace("px", ""));

            if ($(this).attr("id") === "nextFoto") {
                sVerso = "-=" + nStep + "px";
                if (!(-nStep * parseInt(($(".singleImage").length / 6)) < parseInt($("#slideGallery").css("left").replace("px", "")))) {
                    return false;
                }
            } else {
                if (nPos >= -nStep + 1) {
                    return false;
                }
                sVerso = "+=" + nStep + "px";
            }
            $("#slideGallery").animate({
                "left": sVerso
            }, "slow");
        });

        $("form#aiform").delegate("#findonmap", "click", function(e) {
            e.preventDefault();
            searchAddress($('#address').val());
        });

        // SALVATAGGIO VALORI DELLE CHECKBOX
        $("form#aiform").delegate("input[type=\'checkbox\']", "change", function(e) {
            e.preventDefault();
            objModel = API.getFieldByQs(this.name);
            var htmlObjModel = AIFORM.formatHTMLType(objModel);
            value_list = htmlObjModel.get("value_list");
            if (value_list) {
                // SETTAGGIO VALORI DELLE CHECKBOX MULTIPLE
                myVal = [];
                var myArr = $("input[name='" + this.name + "']:checked");
                $.each(myArr, function(i, k) {
                    myVal.push(k.value);
                });
            } else {
                // SETTAGGIO VALORI DELLE CHECKBOX SINGOLE
                myVal = this.checked == true ? $(this).val() : "";
            };

            AD.setField(this.name, myVal);

        });

        // POPOLAMENTO DINAMICO DELLE SELECT DIPENDENTI
        $('form#aiform').delegate('select[name="servicetype"]', 'change', function(e) {
            $("select[name='servicename'] option").remove();

            var option = new Option(API.getFieldByQs('servicename').placeholder);
            option.setAttribute('value', '');
            option.setAttribute('selected', 'selected');

            $("select[name='servicename']").append(option, '');
            API.getSelectValues('servicename', {
                servicetype: this.value
            }, AIFORM.populateSelect);
        });
        $("form#aiform").delegate("select[name='carbrand']", "change", function(e) {
            $("select[name='carmodel'] option").remove();

            var option = new Option('Seleziona il modello');
            option.setAttribute('value', '');
            option.setAttribute('selected', 'selected');

            $('select[name="carmodel"]').append(option, '');
            API.getSelectValues('carmodel', {
                carbrand: this.value
            }, AIFORM.populateSelect);
        });
        $("form#aiform").delegate("select[name='carmodel']", "change", function(e) {
            AD.setField(this.name, this.value);
            var sCarBrand = AD.getField('carbrand'),
                sCarModel = AD.getField('carmodel');

            $("select[name='carversion'] option").remove();

            var option = new Option('Seleziona l\'allestimento');
            option.setAttribute('value', '');
            option.setAttribute('selected', 'selected');

            $('select[name="carversion"]').append(option, '');
            API.getSelectValues('carversion', {
                carbrand: sCarBrand,
                carmodel: sCarModel
            }, AIFORM.populateSelect);
        });
        $("form#aiform").delegate("select[name='bikebrand']", "change", function(e) {
            AD.setField(this.name, this.value);
            $("select[name='bikemodel'] option").remove();

            var option = new Option("Seleziona il modello");
            option.setAttribute("value", "");
            option.setAttribute("selected", "selected");

            $("select[name='bikemodel']").append(option, "");
            API.getSelectValues('bikemodel', {
                bikebrand: this.value
            }, AIFORM.populateSelect);
        });
        $("form#aiform").delegate("select[name='bikemodel']", "change", function(e) {
            AD.setField(this.name, this.value);
            sBikeBrand = AD.getField("bikebrand");
            sBikeModel = AD.getField("bikemodel");
            $("select[name='bikeversion'] option").remove();

            var option = new Option("Seleziona l'allestimento");
            option.setAttribute("value", "");
            option.setAttribute("selected", "selected");

            $("select[name='bikeversion']").append(option, "");
            API.getSelectValues('bikeversion', {
                bikebrand: AD.getField('bikebrand'),
                'bikemodel': AD.getField('bikemodel')
            }, AIFORM.populateSelect);
        });

        $('form#aiform').on('change', 'select, input[type="text"], input[type="password"], textarea', function() {
            if (this.name === 'email') {
                this.value = this.value.toLowerCase();
                AD.setField(this.name, this.value);
            } else {
                AD.setField(this.name, this.value);
            }
        });

        // AUTO TITLE AUTO - MOTO
        var fieldsForAutoTitle = 'select[name="carbrand"], select[name="carmodel"], select[name="regdate"], select[name="bikebrand"], select[name="bikemodel"]';
        $('form#aiform').on('change', fieldsForAutoTitle, function() {
            var category = AD.getField('category');
            var year = document.getElementsByName('regdate')[0].value;
            var yearToAges = {
                '1930': 'Anni 30',
                '1940': 'Anni 40',
                '1950': 'Anni 50',
                '1960': 'Anni 60',
                '1970': 'Anni 70'
            };
            if (year in yearToAges) {
                year = yearToAges[year];
            }

            switch (Number(category)) {
                case 2:
                    var brand = API.getDisplayValue('carbrand', document.getElementsByName('carbrand')[0].value);
                    var model = API.getDisplayValue('carmodel', document.getElementsByName('carmodel')[0].value);
                    break;
                case 3:
                    var brand = API.getDisplayValue('bikebrand', document.getElementsByName('bikebrand')[0].value);
                    var model = API.getDisplayValue('bikemodel', document.getElementsByName('bikemodel')[0].value);
                    break;
            }
            document.getElementsByName('subject')[0].value = AIFORM.autoTitle(brand, model, year);
            $('input[name="subject"]').trigger('change');
        });

        // MAPPA
        $("form#aiform").delegate("input[name='visMappa']", "click", function(e) {
            if ($(this).val() == 1) {
                $("#inputmap").show();
            } else {
                $("#inputmap").hide();
            };

        });

        // AUTOCOMPLETE COMUNE
        $("form#aiform").delegate("input[name='town'],input[name='city']", "blur", function(e) {
            e.preventDefault();
            var element = this;
            var message = {
                'town': 'Seleziona il comune',
                'city': 'Seleziona la provincia'
            };
            if ($(element).val().length > 0) {
                API.setLocationDetails($(element).val(), AD, element.name, function(result) {
                    if (result === false) {
                        $(element).val('');
                        $(element).autocomplete("search", "");
                        AD.showError("aiform", "error", "error_field_", element.name, message[element.name]);
                    } else {
                        $('#zone').remove();
                        $(element).val(result);
                        $(element).removeClass('inputError');
                        AD.clearError('error', 'error_field_' + element.name);
                        var categorySelected = AD.getField('category');
                        if (AD.getField('category') == '7' || AD.getField('category') == '43' || AD.getField('category') == '29' || AD.getField('category') == '30' ||
                            AD.getField('category') == '31' || AD.getField('category') == '32' || AD.getField('category') == '33' || AD.getField('category') == '8') {
                            API.getFields(AD, function(fieldsToReturn) {
                                for (step in fieldsToReturn) {
                                    for (field in fieldsToReturn[step].fields) {
                                        if (fieldsToReturn[step].fields[field].qs == 'zone') {
                                            var zoneObj = AIFORM.createSelectNode(AIFORM.formatHTMLType(fieldsToReturn[step].fields[field]));
                                            $(element).parent().parent().after('<div id="zone" class="rowNode"><label class="lfloat">Zona<br /><span style="font-weight:normal;">(facoltativo)</span></label><div class="boxInput lfloat"></div></div>');
                                            $(element).parent().parent().next().children('.boxInput').append(zoneObj);
                                            break;
                                        }
                                    }
                                }
                            });
                        }
                    };
                    AIUSER.saveCookieData(element.name);
                });
            };
        });

        /* PAIDOPTION SELECTION */
        $('.container').on('change', '.paidoption_list input', function() {
            var categoryPrice = 0,
                existCategoryPrice = !!AD.category_price,
                existValueType = !!AD.values.type;

            if (existCategoryPrice && existValueType && !!AD.category_price[AD.values.type] && !!AD.category_price[AD.values.type].length) {
                categoryPrice = parseFloat(AD.category_price[AD.values.type].replace(',', ''));
            }

            //Manage bundle exclusivity
            if ($(this).closest('.paidoption_list').attr('id') === 'bundle_option') {
                if (this.checked === true) {

                    //Edit, buy single bounce to keep selectable
                    if ($('#buy_bounce').length) {
                        $('#gallery_option').addClass('disabled');
                        $('#bounce_option input').not('#bounce, #buy_bounce').closest('li').addClass('disabled');
                        $('#gallery_option input, #bounce_option input').not('#bounce, #buy_bounce').attr('disabled', 'disabled');

                        if ($('#buy_bounce').is(':checked')) {
                            $('#gallery_option input, #bounce_option input').not('#bounce, #buy_bounce').prop('checked', false);
                        } else {
                            $('#gallery_option input, #bounce_option input').prop('checked', false);
                        }
                    } else {
                        $('#gallery_option, #bounce_option').addClass('disabled');
                        $('#gallery_option input, #bounce_option input').attr('disabled', 'disabled');
                        $('#gallery_option input, #bounce_option input').prop('checked', false);
                    }

                } else {
                    $('#gallery_option, #bounce_option, #bounce_option li').removeClass('disabled');
                    $('#gallery_option input, #bounce_option input').removeAttr('disabled');
                }
            }

            if (this.checked === true) {
                //Auto select paidoption
                if (this.type === 'checkbox') {
                    $('[name="buy_' + this.name + '"]').first().prop('checked', true);
                } else {
                    $(this).closest('.paidoption_options').siblings('.paidoption_title').children('input[type=checkbox]').prop('checked', true);
                }
            } else if (this.type === 'checkbox') {
                //Reset selection on checkbox deselect
                $.each($('[name="buy_' + this.name + '"]'), function(i, element) {
                    element.checked = false;
                });
            }

            updatePaidoptionCart(categoryPrice);
        });

        $("#showAll").click(function() {
            $(".subContainer > #others").toggleClass("collapsed");
            if ($(this).html() === '<span>Nascondi</span>') {
                $(this).html('<span >Vedi tutto l\'annuncio</span>');
            } else {
                $(this).html('<span>Nascondi</span>');
            }
        });
        $("#btnAiSubmit").click(function() {
            window.form_ready = false;
            var userId = $('[data-input-name="email"]').text() || '',
                catId = AD.getField('category') || '';

            if (!$('form#aiform').valid()) {
                AIFORM.focusOnFirstError();
                window.form_ready = true;
                return true;
            }

            if (currentAction === 'edit') {
                $('#input_submit').click();
                return true;
            }
            subito.thresholds.checkThreshold(
                userId,
                catId,
                function(data) {
                    if (data.is_over == true) {

                        var options = {
                            'category': API.getDisplayValue('category', catId),
                            'name': AD.getField('name'),
                            'phone': AD.getField('phone'),
                            'email': AD.getField('email'),
                            'pop_type': 'freemium'
                        };


                        if (data.type_provider === 'SUBSCRIPTIONS') {
                            options.pop_type = 'pro';
                        }

                        subito.thresholds.showThresholdsPopup(data.type_provider, options);

                    } else {
                        $('#input_submit').click();
                    }
                },
                function() {
                    $('#input_submit').click();
                }
            );
        });
        $("#btnBack").click(function() {
            $('#aiPreview').find('.rowNode').remove();
            $('#aiPreview').hide();
            $("#aiInsert").show();
        });

        $("#btnConfirm").click(function(e) {
            window.form_ready = false;
            e.preventDefault();
            if ($("#terms_general").length == 1 && $("#terms_general:checked").length != 1) {
                alert("Per poter proseguire è necessario accettare le condizioni di vendita");
                return false;
            }
            Message.show("Salvataggio dati in corso...");
            // TODO: aggiungo i valori del pagamento nell'ad
            vChart = $(".POOpt input[type='radio']:checked");
            $.each(vChart, function(i, elem) {
                sName = $(elem).attr("name");
                AD.values[sName] = $(elem).val();
                paidOptionEnabled[i] = $(elem).val();
            });

            if ($("input#radio_fast:checked").length > 0) {
                AD.values["payment_method"] = $("input#radio_fast:checked").val();
            } else if ($("input[name='payment_type'][type='radio']:checked").length > 0) {
                myPayment = $("input[name='payment_type'][type='radio']:checked").val();
                AD.values["payment_type"] = myPayment;
            }

            API.aiFormCreate(AD.values, function(createResponse) {
                Message.show("Salvataggio dati in corso...", "loading");
                if (createResponse.status === 'OK') {
                    var tmpCurrAction = currentAction,
                        xitiTrackAction = currentAction,
                        regionMain = (AD.values.region !== '') ? AD.values.region + ' ' + API.jsonConfig.locations[0].regions[AD.values.region].name : '',
                        accountCreated = createResponse.account_created;

                    if (currentAction == 'new') {
                        tmpCurrAction = 'insert';
                        xitiTrackAction = 'newad';
                    }


                    $('#aiConfirm > .container > div > [id^="confirm_page"]').hide();



                    if (createResponse.hasOwnProperty('payment_url')) {
                        var isCatPay = AD.hasOwnProperty('category_price') && (AD.category_price[AD.values.type]) !== '0',
                            aiConfirmPage = '';
                        if (isCatPay) {

                            aiConfirmPage = '#aiConfirm #confirm_page_cat_pay_ok';
                            $(aiConfirmPage).show();

                            if (paidOptionEnabled.length > 0) {
                                trackXiti.track('new_' + xitiTrackAction + '::multiserviced', '0', 0);
                                tc_vars.env_template = 'new_' + xitiTrackAction + '::multiserviced';
                            } else {
                                trackXiti.track('new_' + xitiTrackAction + '::catpriced', '0', 0);
                                tc_vars.env_template = 'new_' + xitiTrackAction + '::catpriced';
                            }

                        } else {
                            if (paidOptionEnabled.length > 1) {

                                aiConfirmPage = '#aiConfirm #confirm_page_multi_paid_options_ok';
                                $(aiConfirmPage).show();

                                trackXiti.track('new_' + xitiTrackAction + '::multiserviced', '0', 0);
                                tc_vars.env_template = 'new_' + xitiTrackAction + '::multiserviced';
                            } else {
                                aiConfirmPage = "#aiConfirm #confirm_page_paid_options_ok";
                                $(aiConfirmPage).find("#confirm_page_service_name").html(AIFORM.paidOptionsMap[paidOptionEnabled[0]]);
                                $(aiConfirmPage).show();

                                switch (paidOptionEnabled[0]) {
                                    case 'buy_autobounce':
                                        poTrackName = 'buy_autobounce8x60';
                                        break;
                                    case 'buy_gallery':
                                        poTrackName = 'buy_gallery7';
                                        break;

                                    default:
                                        poTrackName = paidOptionEnabled[0];
                                }

                                trackXiti.track('new_' + xitiTrackAction + '::' + poTrackName, '0', 0);
                                tc_vars.env_template = 'new_' + xitiTrackAction + '::' + poTrackName;

                            }
                            $(aiConfirmPage).find('#confirm_page_user_email').html(AD.values.email);
                        }

                        AIFORM.paidUrl = createResponse.payment_url;
                    } else {
                        $("#aiConfirm #confirm_page_ok").find("#confirm_page_user_email").html(AD.values.email);
                        $("#aiConfirm #confirm_page_ok").show();

                        if (accountCreated == "1") {
                            $("#aiConfirm #confirm_page_ok_ar_ok").show();
                            $("#aiConfirm #confirm_page_ok_ar_ko").hide();
                        } else {
                            $("#aiConfirm #confirm_page_ok_ar_ko").show();
                            $("#aiConfirm #confirm_page_ok_ar_ok").hide();
                        }

                        trackXiti.track('new_' + xitiTrackAction + '::confirm', '0', 0);
                        tc_vars.env_template = 'new_' + xitiTrackAction + '::confirm';





                    };
                    var sTownCity = '',
                        sCity = '',
                        sTown = '';

                    if ($("input[name='town']").length > 0) {

                        sTownCity = API.getDisplayValue("town", AD.getField("town"));
                        if (sTownCity.indexOf(",") != -1) {
                            sTown = sTownCity.split(",")[0];
                            sCity = sTownCity.split(",")[1].trim();
                        }

                    } else {
                        sTownCity = API.getDisplayValue("city", AD.getField("region") + "_" + AD.getField("city"));
                        sCity = sTownCity;
                        sTown = sTownCity;
                    };



                    setCookie('tc_ad_title', AD.getField('subject'), 365, window.location.hostname.replace(/^[^\.]+/, ''));
                    setCookie('tc_ad_category', API.getDisplayValue('category', AD.getField('category')), 365, window.location.hostname.replace(/^[^\.]+/, ''));
                    setCookie('tc_ad_region', regionMain, 365, window.location.hostname.replace(/^[^\.]+/, ''));

                    setCookie('tc_ad_province', sCity, 365, window.location.hostname.replace(/^[^\.]+/, ''));
                    setCookie('tc_ad_city', API.getDisplayValue("town", AD.getField("town")), 365, window.location.hostname.replace(/^[^\.]+/, ''));

                    slugCarBrand = subito.utils.slugify(API.getDisplayValue("carbrand", AD.getField("carbrand")));
                    slugCarModel = subito.utils.slugify(API.getDisplayValue("carmodel", AD.getField("carmodel")));
                    setCookie('tc_ad_veicoli_brand', slugCarBrand, 365, window.location.hostname.replace(/^[^\.]+/, ''));
                    setCookie('tc_ad_veicoli_model', slugCarModel, 365, window.location.hostname.replace(/^[^\.]+/, ''));

                    slugBikeBrand = subito.utils.slugify(API.getDisplayValue("bikebrand", AD.getField("bikebrand")));
                    slugBikeModel = subito.utils.slugify(API.getDisplayValue("bikemodel", AD.getField("bikemodel")));
                    setCookie('tc_ad_bike_brand', slugBikeBrand, 365, window.location.hostname.replace(/^[^\.]+/, ''));
                    setCookie('tc_ad_bike_model', slugBikeModel, 365, window.location.hostname.replace(/^[^\.]+/, ''));

                    setCookie('tc_ad_veicoli_price', AD.getField('price'), 365, window.location.hostname.replace(/^[^\.]+/, ''));

                    setCookie('tc_ad_amount', AD.getField('price'), 365, window.location.hostname.replace(/^[^\.]+/, ''));
                    setCookie('tc_ad_immo_price', AD.getField('price'), 365, window.location.hostname.replace(/^[^\.]+/, ''));
                    setCookie('tc_ad_immo_mq', AD.getField('size'), 365, window.location.hostname.replace(/^[^\.]+/, ''));


                    tc_vars.confirm_ad_title = getCookie('tc_ad_title') || '';
                    tc_vars.confirm_ad_category = subito.utils.slugify(getCookie('tc_ad_category')) || '';
                    tc_vars.confirm_ad_region = jsonConfiguration.locations[0].regions[AD.getField('region')].name || '';

                    tc_vars.confirm_ad_province = jsonConfiguration.locations[0].cities[ AD.getField('region') + '_' + AD.getField('city') ].name || '';
                    tc_vars.confirm_ad_city = getCookie('tc_ad_city') || '';

                    tc_vars.confirm_ad_veicoli_brand = getCookie('tc_ad_veicoli_brand') || '';
                    tc_vars.confirm_ad_veicoli_model = getCookie('tc_ad_veicoli_model') || '';
                    tc_vars.confirm_ad_veicoli_price = getCookie('tc_ad_veicoli_price') || '';

                    tc_vars.confirm_ad_bike_brand = getCookie('tc_ad_bike_brand') || '';
                    tc_vars.confirm_ad_bike_model = getCookie('tc_ad_bike_model') || '';


                    tc_vars.confirm_ad_amount = getCookie('tc_ad_amount') || '';
                    tc_vars.confirm_ad_immo_price = getCookie('tc_ad_immo_price') || '';
                    tc_vars.confirm_ad_immo_mq = getCookie('tc_ad_immo_mq') || '';

                    $.ajaxSetup({
                        cache: true
                    });

                    $.getScript(subito.configuration.getTcUrl(is_mobile));

                    $('#aiPreview,#dynamicRules,#boxPreview,#more_visibility').hide();
                    $('#aiConfirm').show();
                    $('#mainTitle').text('Conferma annuncio');
                    $('#AdSubject').text('"' + AD.getField('subject') + '"');
                    $('section > nav > ul > li').eq(1).removeClass('active');
                    $('section > nav > ul > li').eq(2).addClass('active');

                    $('#aiformTitleMobile h1').removeClass('active');
                    $('#aiformTitleMobile .step3').addClass('active');

                    window.location.hash = "confirm";
                    Message.hide();

                } else {
                    $("#aiPreview").hide();
                    $("#aiInsert").show();
                    // e in caso d'errore????
                    $.unblockUI();
                    alert('Annuncio NON inserito!');
                };

                window.form_ready = true;
            });

        });

        $('#aiform').submit(function(e) {
            e.preventDefault();
            var regionMain = '';
            try {
                regionMain = AD.getField("region") + " " + API.jsonConfig.locations[0].regions[AD.getField("region")].name;
            } catch (err) {
                regionMain = '';
            }

            if ($('#code').length > 0) {
                AD.values['code'] = $('#code').val();
            }

            if ($('[name="visMappa"]:checked').val() === '1') {
                var nLat = document.forms.aiform.latitude.value,
                    nLogn = document.forms.aiform.longitude.value,
                    nZoom = document.forms.aiform.zoom.value;

                AD.values.map = nLat + "," + nLogn + "," + nZoom;
            };

            Message.show("Verifica dati in corso...", "loading");
            if ($("#fileSelect").length == 0) {

                API.deleteAllImages(function(data) {
                    if (data.status === 'OK') {
                        delete(AD.mainImage);
                        delete(AD.extraImages);
                    } else {
                        //console.log("Impossible cancellare le immagini sul server nn necessarie");
                    }
                    API.aiFormVerify(AD.values, function(data) {
                        AD.clearErrors("error");
                        if (data.status === 'OK') {
                            $("#nextFoto,#prevFoto,#listphotos").hide();
                            AIFORM.buildPreview(AD);

                            var tmpCurrAction = '';

                            if (currentAction == 'new') {
                                tmpCurrAction = 'insert';
                            } else {
                                tmpCurrAction = currentAction;
                            }


                        } else {
                            var sErrors = '';
                            $.each(data.errors, function(iter, item) {
                                sErrors += data.errors[iter] + '|';
                            });
                            var tmpCurrAction = '';

                            if (currentAction == 'new') {
                                tmpCurrAction = 'insert';
                            } else {
                                tmpCurrAction = currentAction;
                            }

                            Message.hide();
                            Message.show('Impossibile verificare l\'annuncio', 'error');
                            AD.showErrors("aiform", "error", "error_field_", data.errors);
                            AIFORM.focusOnFirstError($.unblockUI);
                        };
                    });

                });
            } else {
                API.aiFormVerify(AD.values, function(data) {
                    AD.clearErrors("error");
                    if (data.status === 'OK') {
                        var tmpCurrAction = '';

                        if (currentAction == 'new') {
                            tmpCurrAction = 'insert';
                        } else {
                            tmpCurrAction = currentAction;
                        }

                        $("#nextFoto,#prevFoto,#listphotos").hide();

                        uploadAll(

                            function() {
                                AIFORM.doneImages('#fileList', function() {
                                    AIFORM.buildPreview(AD);
                                    if (typeof(AD.extraImages) != 'undefined') {
                                        if ($("#backgroundWhiteMobile").length === 0) {
                                            if (AD.extraImages.length > 0) {
                                                $('#listphotos').show();
                                            };
                                            if (AD.extraImages.length > 6) {
                                                $("#nextFoto,#prevFoto").show();
                                            };
                                        };
                                    };
                                });
                            });

                    } else {
                        var sErrors = '';
                        $.each(data.errors, function(iter, item) {
                            sErrors += data.errors[iter] + '|';
                        });
                        var tmpCurrAction = '';

                        if (currentAction == 'new') {
                            tmpCurrAction = 'insert';
                        } else {
                            tmpCurrAction = currentAction;
                        }
                        AD.showErrors("aiform", "error", "error_field_", data.errors);
                        AIFORM.focusOnFirstError($.unblockUI);
                    };
                });
            };

        });

        /** ******************* OBJCAT *********************** */
        $("form#aiform").delegate("select[name='category']", "change", function(e) {
            e.preventDefault();

            // TODO funziona solo al change cat?
            var nCategory = $(this).val();
            var sSubject = $("input[name='subject']").val();
            var sBody = $("textarea[name='body']").val();
            objCat.adCategory = nCategory;
            objCat.citesSearching(sSubject, sBody);
            objCat.drawRules();
        });

        $("#aiInsert").on("blur", "input,select,textarea", function() {
            var toolTip = $(this).parent().parent().children('.tooltip');
            if (!window.stopblur) {
                toolTip.hide();
            } else {
                setTimeout(function() {
                    toolTip.hide();
                }, 200);
            }
            window.stopblur = false;
        });

        $("#aiInsert").delegate(".stopblur", "mousedown", function() {
            window.stopblur = true;
        });

        $("#aiInsert").on("focus", "input,select,textarea", function() {
            $(this).removeClass('inputError');
            var toolTip = $(this).parent().parent().children('.tooltip');
            toolTip.show();
        });

        $("form#aiform").delegate(".remove", "click", function(e) {
            e.preventDefault();
            removeImage(this);
        });

        $("form#aiform").delegate(".rotate", "click", function(e) {
            e.preventDefault();
            rotateImage(this);
        });

        $("form#aiform").delegate(".thumb", "click", function(e) {
            e.preventDefault();
            clickinit2();
        });

        $("#subject, #body").blur(function() {
            objCat.citesSearching($("#subject").val(), $("#body").val());
        });

        /** ******************* fine OBJCAT *********************** */
    });

    /* EVENTS CHANGE HASH */
    $(window).on('hashchange', function(e) {
        switch (window.location.hash) {
            case "#insert":
                AIFORM.showInsert();
                break;
            case "#verify":
                AIFORM.showVerify();
                break;
        }
        window.scrollTo(0, 0);
    });
});
/*!
 * jQuery blockUI plugin
 * Version 2.66.0-2013.10.09
 * Requires jQuery v1.7 or later
 *
 * Examples at: http://malsup.com/jquery/block/
 * Copyright (c) 2007-2013 M. Alsup
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * Thanks to Amir-Hossein Sobhi for some excellent contributions!
 */

;(function() {
    /*jshint eqeqeq:false curly:false latedef:false */
    "use strict";

    function setup($) {
        $.fn._fadeIn = $.fn.fadeIn;

        var noOp = $.noop || function() {};

        // this bit is to ensure we don't call setExpression when we shouldn't (with extra muscle to handle
        // confusing userAgent strings on Vista)
        var msie = /MSIE/.test(navigator.userAgent);
        var ie6  = /MSIE 6.0/.test(navigator.userAgent) && ! /MSIE 8.0/.test(navigator.userAgent);
        var mode = document.documentMode || 0;
        var setExpr = $.isFunction( document.createElement('div').style.setExpression );

        // global $ methods for blocking/unblocking the entire page
        $.blockUI   = function(opts) { install(window, opts); };
        $.unblockUI = function(opts) { remove(window, opts); };

        // convenience method for quick growl-like notifications  (http://www.google.com/search?q=growl)
        $.growlUI = function(title, message, timeout, onClose) {
            var $m = $('<div class="growlUI"></div>');
            if (title) $m.append('<h1>'+title+'</h1>');
            if (message) $m.append('<h2>'+message+'</h2>');
            if (timeout === undefined) timeout = 3000;

            // Added by konapun: Set timeout to 30 seconds if this growl is moused over, like normal toast notifications
            var callBlock = function(opts) {
                opts = opts || {};

                $.blockUI({
                    message: $m,
                    fadeIn : typeof opts.fadeIn  !== 'undefined' ? opts.fadeIn  : 700,
                    fadeOut: typeof opts.fadeOut !== 'undefined' ? opts.fadeOut : 1000,
                    timeout: typeof opts.timeout !== 'undefined' ? opts.timeout : timeout,
                    centerY: false,
                    showOverlay: false,
                    onUnblock: onClose,
                    css: $.blockUI.defaults.growlCSS
                });
            };

            callBlock();
            var nonmousedOpacity = $m.css('opacity');
            $m.mouseover(function() {
                callBlock({
                    fadeIn: 0,
                    timeout: 30000
                });

                var displayBlock = $('.blockMsg');
                displayBlock.stop(); // cancel fadeout if it has started
                displayBlock.fadeTo(300, 1); // make it easier to read the message by removing transparency
            }).mouseout(function() {
                $('.blockMsg').fadeOut(1000);
            });
            // End konapun additions
        };

        // plugin method for blocking element content
        $.fn.block = function(opts) {
            if ( this[0] === window ) {
                $.blockUI( opts );
                return this;
            }
            var fullOpts = $.extend({}, $.blockUI.defaults, opts || {});
            this.each(function() {
                var $el = $(this);
                if (fullOpts.ignoreIfBlocked && $el.data('blockUI.isBlocked'))
                    return;
                $el.unblock({ fadeOut: 0 });
            });

            return this.each(function() {
                if ($.css(this,'position') == 'static') {
                    this.style.position = 'relative';
                    $(this).data('blockUI.static', true);
                }
                this.style.zoom = 1; // force 'hasLayout' in ie
                install(this, opts);
            });
        };

        // plugin method for unblocking element content
        $.fn.unblock = function(opts) {
            if ( this[0] === window ) {
                $.unblockUI( opts );
                return this;
            }
            return this.each(function() {
                remove(this, opts);
            });
        };

        $.blockUI.version = 2.66; // 2nd generation blocking at no extra cost!

        // override these in your code to change the default behavior and style
        $.blockUI.defaults = {
            // message displayed when blocking (use null for no message)
            message:  '<h1>Please wait...</h1>',

            title: null,		// title string; only used when theme == true
            draggable: true,	// only used when theme == true (requires jquery-ui.js to be loaded)

            theme: false, // set to true to use with jQuery UI themes

            // styles for the message when blocking; if you wish to disable
            // these and use an external stylesheet then do this in your code:
            // $.blockUI.defaults.css = {};
            css: {
                padding:	0,
                margin:		0,
                width:		'30%',
                top:		'40%',
                left:		'35%',
                textAlign:	'center',
                color:		'#000',
                border:		'3px solid #aaa',
                backgroundColor:'#fff',
                cursor:		'wait'
            },

            // minimal style set used when themes are used
            themedCSS: {
                width:	'30%',
                top:	'40%',
                left:	'35%'
            },

            // styles for the overlay
            overlayCSS:  {
                backgroundColor:	'#000',
                opacity:			0.6,
                cursor:				'wait'
            },

            // style to replace wait cursor before unblocking to correct issue
            // of lingering wait cursor
            cursorReset: 'default',

            // styles applied when using $.growlUI
            growlCSS: {
                width:		'350px',
                top:		'10px',
                left:		'',
                right:		'10px',
                border:		'none',
                padding:	'5px',
                opacity:	0.6,
                cursor:		'default',
                color:		'#fff',
                backgroundColor: '#000',
                '-webkit-border-radius':'10px',
                '-moz-border-radius':	'10px',
                'border-radius':		'10px'
            },

            // IE issues: 'about:blank' fails on HTTPS and javascript:false is s-l-o-w
            // (hat tip to Jorge H. N. de Vasconcelos)
            /*jshint scripturl:true */
            iframeSrc: /^https/i.test(window.location.href || '') ? 'javascript:false' : 'about:blank',

            // force usage of iframe in non-IE browsers (handy for blocking applets)
            forceIframe: false,

            // z-index for the blocking overlay
            baseZ: 1000,

            // set these to true to have the message automatically centered
            centerX: true, // <-- only effects element blocking (page block controlled via css above)
            centerY: true,

            // allow body element to be stetched in ie6; this makes blocking look better
            // on "short" pages.  disable if you wish to prevent changes to the body height
            allowBodyStretch: true,

            // enable if you want key and mouse events to be disabled for content that is blocked
            bindEvents: true,

            // be default blockUI will supress tab navigation from leaving blocking content
            // (if bindEvents is true)
            constrainTabKey: true,

            // fadeIn time in millis; set to 0 to disable fadeIn on block
            fadeIn:  200,

            // fadeOut time in millis; set to 0 to disable fadeOut on unblock
            fadeOut:  400,

            // time in millis to wait before auto-unblocking; set to 0 to disable auto-unblock
            timeout: 0,

            // disable if you don't want to show the overlay
            showOverlay: true,

            // if true, focus will be placed in the first available input field when
            // page blocking
            focusInput: true,

            // elements that can receive focus
            focusableElements: ':input:enabled:visible',

            // suppresses the use of overlay styles on FF/Linux (due to performance issues with opacity)
            // no longer needed in 2012
            // applyPlatformOpacityRules: true,

            // callback method invoked when fadeIn has completed and blocking message is visible
            onBlock: null,

            // callback method invoked when unblocking has completed; the callback is
            // passed the element that has been unblocked (which is the window object for page
            // blocks) and the options that were passed to the unblock call:
            //	onUnblock(element, options)
            onUnblock: null,

            // callback method invoked when the overlay area is clicked.
            // setting this will turn the cursor to a pointer, otherwise cursor defined in overlayCss will be used.
            onOverlayClick: null,

            // don't ask; if you really must know: http://groups.google.com/group/jquery-en/browse_thread/thread/36640a8730503595/2f6a79a77a78e493#2f6a79a77a78e493
            quirksmodeOffsetHack: 4,

            // class name of the message block
            blockMsgClass: 'blockMsg',

            // if it is already blocked, then ignore it (don't unblock and reblock)
            ignoreIfBlocked: false
        };

        // private data and functions follow...

        var pageBlock = null;
        var pageBlockEls = [];

        function install(el, opts) {
            var css, themedCSS;
            var full = (el == window);
            var msg = (opts && opts.message !== undefined ? opts.message : undefined);
            opts = $.extend({}, $.blockUI.defaults, opts || {});

            if (opts.ignoreIfBlocked && $(el).data('blockUI.isBlocked'))
                return;

            opts.overlayCSS = $.extend({}, $.blockUI.defaults.overlayCSS, opts.overlayCSS || {});
            css = $.extend({}, $.blockUI.defaults.css, opts.css || {});
            if (opts.onOverlayClick)
                opts.overlayCSS.cursor = 'pointer';

            themedCSS = $.extend({}, $.blockUI.defaults.themedCSS, opts.themedCSS || {});
            msg = msg === undefined ? opts.message : msg;

            // remove the current block (if there is one)
            if (full && pageBlock)
                remove(window, {fadeOut:0});

            // if an existing element is being used as the blocking content then we capture
            // its current place in the DOM (and current display style) so we can restore
            // it when we unblock
            if (msg && typeof msg != 'string' && (msg.parentNode || msg.jquery)) {
                var node = msg.jquery ? msg[0] : msg;
                var data = {};
                $(el).data('blockUI.history', data);
                data.el = node;
                data.parent = node.parentNode;
                data.display = node.style.display;
                data.position = node.style.position;
                if (data.parent)
                    data.parent.removeChild(node);
            }

            $(el).data('blockUI.onUnblock', opts.onUnblock);
            var z = opts.baseZ;

            // blockUI uses 3 layers for blocking, for simplicity they are all used on every platform;
            // layer1 is the iframe layer which is used to supress bleed through of underlying content
            // layer2 is the overlay layer which has opacity and a wait cursor (by default)
            // layer3 is the message content that is displayed while blocking
            var lyr1, lyr2, lyr3, s;
            if (msie || opts.forceIframe)
                lyr1 = $('<iframe class="blockUI" style="z-index:'+ (z++) +';display:none;border:none;margin:0;padding:0;position:absolute;width:100%;height:100%;top:0;left:0" src="'+opts.iframeSrc+'"></iframe>');
            else
                lyr1 = $('<div class="blockUI" style="display:none"></div>');

            if (opts.theme)
                lyr2 = $('<div class="blockUI blockOverlay ui-widget-overlay" style="z-index:'+ (z++) +';display:none"></div>');
            else
                lyr2 = $('<div class="blockUI blockOverlay" style="z-index:'+ (z++) +';display:none;border:none;margin:0;padding:0;width:100%;height:100%;top:0;left:0"></div>');

            if (opts.theme && full) {
                s = '<div class="blockUI ' + opts.blockMsgClass + ' blockPage ui-dialog ui-widget ui-corner-all" style="z-index:'+(z+10)+';display:none;position:fixed">';
                if ( opts.title ) {
                    s += '<div class="ui-widget-header ui-dialog-titlebar ui-corner-all blockTitle">'+(opts.title || '&nbsp;')+'</div>';
                }
                s += '<div class="ui-widget-content ui-dialog-content"></div>';
                s += '</div>';
            }
            else if (opts.theme) {
                s = '<div class="blockUI ' + opts.blockMsgClass + ' blockElement ui-dialog ui-widget ui-corner-all" style="z-index:'+(z+10)+';display:none;position:absolute">';
                if ( opts.title ) {
                    s += '<div class="ui-widget-header ui-dialog-titlebar ui-corner-all blockTitle">'+(opts.title || '&nbsp;')+'</div>';
                }
                s += '<div class="ui-widget-content ui-dialog-content"></div>';
                s += '</div>';
            }
            else if (full) {
                s = '<div class="blockUI ' + opts.blockMsgClass + ' blockPage" style="z-index:'+(z+10)+';display:none;position:fixed"></div>';
            }
            else {
                s = '<div class="blockUI ' + opts.blockMsgClass + ' blockElement" style="z-index:'+(z+10)+';display:none;position:absolute"></div>';
            }
            lyr3 = $(s);

            // if we have a message, style it
            if (msg) {
                if (opts.theme) {
                    lyr3.css(themedCSS);
                    lyr3.addClass('ui-widget-content');
                }
                else
                    lyr3.css(css);
            }

            // style the overlay
            if (!opts.theme /*&& (!opts.applyPlatformOpacityRules)*/)
                lyr2.css(opts.overlayCSS);
            lyr2.css('position', full ? 'fixed' : 'absolute');

            // make iframe layer transparent in IE
            if (msie || opts.forceIframe)
                lyr1.css('opacity',0.0);

            //$([lyr1[0],lyr2[0],lyr3[0]]).appendTo(full ? 'body' : el);
            var layers = [lyr1,lyr2,lyr3], $par = full ? $('body') : $(el);
            $.each(layers, function() {
                this.appendTo($par);
            });

            if (opts.theme && opts.draggable && $.fn.draggable) {
                lyr3.draggable({
                    handle: '.ui-dialog-titlebar',
                    cancel: 'li'
                });
            }

            // ie7 must use absolute positioning in quirks mode and to account for activex issues (when scrolling)
            var expr = setExpr && (!$.support.boxModel || $('object,embed', full ? null : el).length > 0);
            if (ie6 || expr) {
                // give body 100% height
                if (full && opts.allowBodyStretch && $.support.boxModel)
                    $('html,body').css('height','100%');

                // fix ie6 issue when blocked element has a border width
                if ((ie6 || !$.support.boxModel) && !full) {
                    var t = sz(el,'borderTopWidth'), l = sz(el,'borderLeftWidth');
                    var fixT = t ? '(0 - '+t+')' : 0;
                    var fixL = l ? '(0 - '+l+')' : 0;
                }

                // simulate fixed position
                $.each(layers, function(i,o) {
                    var s = o[0].style;
                    s.position = 'absolute';
                    if (i < 2) {
                        if (full)
                            s.setExpression('height','Math.max(document.body.scrollHeight, document.body.offsetHeight) - (jQuery.support.boxModel?0:'+opts.quirksmodeOffsetHack+') + "px"');
                        else
                            s.setExpression('height','this.parentNode.offsetHeight + "px"');
                        if (full)
                            s.setExpression('width','jQuery.support.boxModel && document.documentElement.clientWidth || document.body.clientWidth + "px"');
                        else
                            s.setExpression('width','this.parentNode.offsetWidth + "px"');
                        if (fixL) s.setExpression('left', fixL);
                        if (fixT) s.setExpression('top', fixT);
                    }
                    else if (opts.centerY) {
                        if (full) s.setExpression('top','(document.documentElement.clientHeight || document.body.clientHeight) / 2 - (this.offsetHeight / 2) + (blah = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"');
                        s.marginTop = 0;
                    }
                    else if (!opts.centerY && full) {
                        var top = (opts.css && opts.css.top) ? parseInt(opts.css.top, 10) : 0;
                        var expression = '((document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + '+top+') + "px"';
                        s.setExpression('top',expression);
                    }
                });
            }

            // show the message
            if (msg) {
                if (opts.theme)
                    lyr3.find('.ui-widget-content').append(msg);
                else
                    lyr3.append(msg);
                if (msg.jquery || msg.nodeType)
                    $(msg).show();
            }

            if ((msie || opts.forceIframe) && opts.showOverlay)
                lyr1.show(); // opacity is zero
            if (opts.fadeIn) {
                var cb = opts.onBlock ? opts.onBlock : noOp;
                var cb1 = (opts.showOverlay && !msg) ? cb : noOp;
                var cb2 = msg ? cb : noOp;
                if (opts.showOverlay)
                    lyr2._fadeIn(opts.fadeIn, cb1);
                if (msg)
                    lyr3._fadeIn(opts.fadeIn, cb2);
            }
            else {
                if (opts.showOverlay)
                    lyr2.show();
                if (msg)
                    lyr3.show();
                if (opts.onBlock)
                    opts.onBlock();
            }

            // bind key and mouse events
            bind(1, el, opts);

            if (full) {
                pageBlock = lyr3[0];
                pageBlockEls = $(opts.focusableElements,pageBlock);
                if (opts.focusInput)
                    setTimeout(focus, 20);
            }
            else
                center(lyr3[0], opts.centerX, opts.centerY);

            if (opts.timeout) {
                // auto-unblock
                var to = setTimeout(function() {
                    if (full)
                        $.unblockUI(opts);
                    else
                        $(el).unblock(opts);
                }, opts.timeout);
                $(el).data('blockUI.timeout', to);
            }
        }

        // remove the block
        function remove(el, opts) {
            var count;
            var full = (el == window);
            var $el = $(el);
            var data = $el.data('blockUI.history');
            var to = $el.data('blockUI.timeout');
            if (to) {
                clearTimeout(to);
                $el.removeData('blockUI.timeout');
            }
            opts = $.extend({}, $.blockUI.defaults, opts || {});
            bind(0, el, opts); // unbind events

            if (opts.onUnblock === null) {
                opts.onUnblock = $el.data('blockUI.onUnblock');
                $el.removeData('blockUI.onUnblock');
            }

            var els;
            if (full) // crazy selector to handle odd field errors in ie6/7
                els = $('body').children().filter('.blockUI').add('body > .blockUI');
            else
                els = $el.find('>.blockUI');

            // fix cursor issue
            if ( opts.cursorReset ) {
                if ( els.length > 1 )
                    els[1].style.cursor = opts.cursorReset;
                if ( els.length > 2 )
                    els[2].style.cursor = opts.cursorReset;
            }

            if (full)
                pageBlock = pageBlockEls = null;

            if (opts.fadeOut) {
                count = els.length;
                els.stop().fadeOut(opts.fadeOut, function() {
                    if ( --count === 0)
                        reset(els,data,opts,el);
                });
            }
            else
                reset(els, data, opts, el);
        }

        // move blocking element back into the DOM where it started
        function reset(els,data,opts,el) {
            var $el = $(el);
            if ( $el.data('blockUI.isBlocked') )
                return;

            els.each(function(i,o) {
                // remove via DOM calls so we don't lose event handlers
                if (this.parentNode)
                    this.parentNode.removeChild(this);
            });

            if (data && data.el) {
                data.el.style.display = data.display;
                data.el.style.position = data.position;
                if (data.parent)
                    data.parent.appendChild(data.el);
                $el.removeData('blockUI.history');
            }

            if ($el.data('blockUI.static')) {
                $el.css('position', 'static'); // #22
            }

            if (typeof opts.onUnblock == 'function')
                opts.onUnblock(el,opts);

            // fix issue in Safari 6 where block artifacts remain until reflow
            var body = $(document.body), w = body.width(), cssW = body[0].style.width;
            body.width(w-1).width(w);
            body[0].style.width = cssW;
        }

        // bind/unbind the handler
        function bind(b, el, opts) {
            var full = el == window, $el = $(el);

            // don't bother unbinding if there is nothing to unbind
            if (!b && (full && !pageBlock || !full && !$el.data('blockUI.isBlocked')))
                return;

            $el.data('blockUI.isBlocked', b);

            // don't bind events when overlay is not in use or if bindEvents is false
            if (!full || !opts.bindEvents || (b && !opts.showOverlay))
                return;

            // bind anchors and inputs for mouse and key events
            var events = 'mousedown mouseup keydown keypress keyup touchstart touchend touchmove';
            if (b)
                $(document).bind(events, opts, handler);
            else
                $(document).unbind(events, handler);

            // former impl...
            //		var $e = $('a,:input');
            //		b ? $e.bind(events, opts, handler) : $e.unbind(events, handler);
        }

        // event handler to suppress keyboard/mouse events when blocking
        function handler(e) {
            // allow tab navigation (conditionally)
            if (e.type === 'keydown' && e.keyCode && e.keyCode == 9) {
                if (pageBlock && e.data.constrainTabKey) {
                    var els = pageBlockEls;
                    var fwd = !e.shiftKey && e.target === els[els.length-1];
                    var back = e.shiftKey && e.target === els[0];
                    if (fwd || back) {
                        setTimeout(function(){focus(back);},10);
                        return false;
                    }
                }
            }
            var opts = e.data;
            var target = $(e.target);
            if (target.hasClass('blockOverlay') && opts.onOverlayClick)
                opts.onOverlayClick(e);

            // allow events within the message content
            if (target.parents('div.' + opts.blockMsgClass).length > 0)
                return true;

            // allow events for content that is not being blocked
            return target.parents().children().filter('div.blockUI').length === 0;
        }

        function focus(back) {
            if (!pageBlockEls)
                return;
            var e = pageBlockEls[back===true ? pageBlockEls.length-1 : 0];
            if (e)
                e.focus();
        }

        function center(el, x, y) {
            var p = el.parentNode, s = el.style;
            var l = ((p.offsetWidth - el.offsetWidth)/2) - sz(p,'borderLeftWidth');
            var t = ((p.offsetHeight - el.offsetHeight)/2) - sz(p,'borderTopWidth');
            if (x) s.left = l > 0 ? (l+'px') : '0';
            if (y) s.top  = t > 0 ? (t+'px') : '0';
        }

        function sz(el, p) {
            return parseInt($.css(el,p),10)||0;
        }

    }


    /*global define:true */
    if (typeof define === 'function' && define.amd && define.amd.jQuery) {
        define(['jquery'], setup);
    } else {
        setup(jQuery);
    }

})();