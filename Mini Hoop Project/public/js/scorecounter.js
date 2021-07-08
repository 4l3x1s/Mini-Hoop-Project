(function () {
        //Port to be added
        var ws = new WebSocket('ws://', 'json');
        var score = 0;

        ws.onopen = function () {
            console.log('Websocket ON');
            ws.send("Let's play!");
            document.getElementById('score').innerHTML = score;
        };

        ws.onmessage = function (event) {
            if (event.data.indexOf('Score:') != -1) {
                score++;
                document.getElementById('score').innerHTML = score;
            }
        };

        ws.onerror = function (error) {
            console.log('Error: ' + error.data);
        }

    }
    ()
);