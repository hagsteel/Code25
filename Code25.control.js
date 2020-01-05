loadAPI(7);

// consts
var PAGE_UP = 16;
var PAGE_DOWN = 17;
var PARAMETER_COUNT = 16;

// Remove this if you want to be able to use deprecated methods without causing script to stop.
// This is useful during development.
host.setShouldFailOnDeprecatedUse(true);

host.defineController("M-Audio", "Code25", "0.1", "0f2dfbae-0fa0-48a7-b67e-8274d782d6dc", "hagsteel");

host.defineMidiPorts(1, 0);

if (host.platformIsWindows())
{
   // TODO: Set the correct names of the ports for auto detection on Windows platform here
   // and uncomment this when port names are correct.
   // host.addDeviceNameBasedDiscoveryPair(["Input Port 0"], ["Output Port 0", "Output Port -1"]);
}
else if (host.platformIsMac())
{
   // TODO: Set the correct names of the ports for auto detection on Mac OSX platform here
   // and uncomment this when port names are correct.
   // host.addDeviceNameBasedDiscoveryPair(["Input Port 0"], ["Output Port 0", "Output Port -1"]);
}
else if (host.platformIsLinux())
{
   // TODO: Set the correct names of the ports for auto detection on Linux platform here
   // and uncomment this when port names are correct.
   // host.addDeviceNameBasedDiscoveryPair(["Input Port 1"], ["Output Port 1", "Output Port 0"]);
}

function init() {
    transport = host.createTransport();
    host.getMidiInPort(0).setMidiCallback(onMidi0);
    host.getMidiInPort(0).setSysexCallback(onSysex0);

    // Note input (everything not in here is sent to onMidi0)
    noteIn = host.getMidiInPort(0).createNoteInput("Code25", "80????", "90????", "99????", "89????", "E0????");

    // User programmable controls
    // userControls = host.createUserControls(parameterCount);

    // Master track (currently used for setting volume)
    masterTrackView = host.createMasterTrack(5);

    // What's this
    cursorTrack = host.createCursorTrack(3, 5);
    // currentDevice = host.createEditorCursorDevice(2);
    cursorDevice = cursorTrack.createCursorDevice("Primary", "Primary", 4, CursorDeviceFollowMode.FOLLOW_SELECTION);
 
    // Create remote controls page
    remoteControl = cursorDevice.createCursorRemoteControlsPage(PARAMETER_COUNT); 

    // User controls (still don't know)
    for (var i = 0; i < PARAMETER_COUNT; i += 1) {
        // userControls.getControl(i).setIndication(true);
        remoteControl.getParameter(i).setIndication(true); 
    }

    println("Code25 initialized! (with note input)");
}

// Called when a short MIDI message is received on MIDI input port 0.
function onMidi0(status, data1, data2) {
    // Debug data
    // ----------
    // data1 = CC
    // data2 = value of slider etc.
    // var s = "status: " + status + " data1: " + data1 + " data2: " + data2;
    // println(s);

    // Volume control
    if (status === 176 && data1 === 47) {
        masterTrackView.volume().set(data2 / 127.0); 
    }

    // User controls
    if (status === 176 && data1 >= 20 && data1 <= 20 + PARAMETER_COUNT) {
        var idx = data1 - 20;
        var param = remoteControl.getParameter(idx).value().set(data2, 128); 
    }

    // Page select
    if (status === 176) {
        if (data1 == PAGE_DOWN) {
            remoteControl.selectNextPage(true);
        } else if (data1 == PAGE_UP) {
            remoteControl.selectPreviousPage(true);
        } 
    }
}

// Called when a MIDI sysex message is received on MIDI input port 0.
function onSysex0(data) {
   // MMC Transport Controls:
   switch (data) {
      case "f07f7f0605f7":
         transport.rewind();
         break;
      case "f07f7f0604f7":
         transport.fastForward();
         break;
      case "f07f7f0601f7":
         transport.stop();
         break;
      case "f07f7f0602f7":
         transport.play();
         break;
      case "f07f7f0606f7":
         transport.record();
         break;
   }
}

function flush() {
   // TODO: Flush any output to your controller here.
}

function exit() {

}
