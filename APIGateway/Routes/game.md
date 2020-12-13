Endpoints

At start, player needs names of other players

From there, user initializes a player data array which consists of the names, # of characters finished, finishing time for a player,
final position

Server sends signal for everyone to start the race, which starts the timer of the player side. 

User calculates their data, and sends chars finished to the server, then the server sends that data to the players. 

When someone finishes, they send their final time to the server, once the server receives it, it calculates the position and sends it out. 

Server can calculate the lpm. 

Everyone needs the race code string and the time limit. 
//////////

Get Game Endpoint:

/gaming/game

Feed a lobby code

response:
{
    players: Array,
    time: Integer,
    lobbyName: String,
    raceString: String
}

Every two seconds:

/gaming/update

request body:
{
    charactersFinished: Integer,

}

At the end, or when player finished, whichever comes first:

/gaming/finish

request body:
{
    finalTime: Float
}

This will cause 'player finished' event

When everyone is connected, then start. 

Events --------------------------

When the host presses start game in the lobby:

'start game'

Directs everyone to the gaming page

On component did mount, their will be a request to get game data.

Event for when someone gets onto the game page:

'joined game'

When everyone is in the game, start the countdown.

Evetn for when a player finishes:

'player finished'

{
    username: String,
    position: Integer (Final placement)
}

Stop race event:

'stop race'

{
    lobbyCode: String
}

When the game is finished for everyone, upload game stats to firebase. 

