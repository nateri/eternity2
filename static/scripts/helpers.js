
function stringify(obj, str)
{
  if (obj.hasOwnProperty(str) && null != obj[str])
  {
    //console.debug(obj[str]);
    obj[str] = obj[str].toString();
  }
}

function formattedDate(date)
{
  var d = new Date(date || Date.now()),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [month, day, year].join('/');
}

function generateUUID()
{
  var d = Date.now();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (d + Math.random()*16)%16 | 0;
    d = Math.floor(d/16);
    return (c=='x' ? r : (r&0x3|0x8)).toString(16);
  });
  return uuid;
};


function makeSyntaxHighlight(json) {
    if (typeof json != 'string') {
         json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

function makeSyntaxHighlightHtml(json) {
    var html = "<style>pre {outline: 1px solid #ccc; padding: 5px; margin: 5px; } .string { color: green; } ";
    html+= " .number { color: darkorange; } .boolean { color: blue; } .null { color: magenta; } .key { color: red; }</style>";
    html+= "<pre>"+makeSyntaxHighlight(json)+"</pre>";
    return html;
}



/////////////////////////////////////////
// Debug
function makeSyntaxHighlight(json) {
    if (typeof json != 'string') {
         json = JSON.stringify(json, undefined, 3);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

function popupDebug(obj) {
  var json = makeSyntaxHighlight(obj);
  var w = window.open();
  var html = "<head><style>pre {outline: 1px solid #ccc; padding: 5px; margin: 5px; } .string { color: green; } ";
  html+= " .number { color: darkorange; } .boolean { color: blue; } .null { color: magenta; } .key { color: red; }</style></head><body>";
  html+= "<pre>"+json+"</pre>";
  w.document.writeln(html);
}
/////////////////////////////////////////
