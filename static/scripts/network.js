
HttpClient = function() {
  this.get = function(aUrl, aCallback)
  {
    anHttpRequest = new XMLHttpRequest();
    anHttpRequest.onreadystatechange = function()
    { 
      console.log("["+aUrl.toString()+"] [state: " + anHttpRequest.readyState + "] [status: " + anHttpRequest.status + "]");
      console.debug(anHttpRequest);
      if (anHttpRequest.readyState == 4)
      {
        if (anHttpRequest.status == 200 /*|| anHttpRequest.status == 0*/)
        {
          aCallback(true, anHttpRequest.responseText);
        }
        else
        {
          aCallback(false);
        }
      }
    }

    anHttpRequest.open( "GET", aUrl, true );            
    anHttpRequest.send(null);
  }
}

