import Foundation
import CoreGraphics
// postkey <pid> <keycode> [cmd|shift|alt|ctrl ...]   — a key press delivered to one process only
let a = CommandLine.arguments
let pid = pid_t(a[1])!; let code = CGKeyCode(a[2])!
var flags = CGEventFlags()
for m in a.dropFirst(3) { switch m { case "cmd": flags.insert(.maskCommand); case "shift": flags.insert(.maskShift); case "alt": flags.insert(.maskAlternate); case "ctrl": flags.insert(.maskControl); default: break } }
let src = CGEventSource(stateID: .hidSystemState)
let down = CGEvent(keyboardEventSource: src, virtualKey: code, keyDown: true)!; down.flags = flags
let up = CGEvent(keyboardEventSource: src, virtualKey: code, keyDown: false)!; up.flags = flags
down.postToPid(pid); usleep(60000); up.postToPid(pid)
print("posted key \(code) flags \(flags.rawValue) to pid \(pid)")
