import CoreGraphics
import Foundation
let opts: CGWindowListOption = [.optionAll]
let list = CGWindowListCopyWindowInfo(opts, kCGNullWindowID) as! [[String: Any]]
for w in list {
  let pid = w[kCGWindowOwnerPID as String] as? Int ?? 0
  let owner = w[kCGWindowOwnerName as String] as? String ?? ""
  if owner != "Live" { continue }
  let num = w[kCGWindowNumber as String] as? Int ?? 0
  let name = w[kCGWindowName as String] as? String ?? ""
  let layer = w[kCGWindowLayer as String] as? Int ?? 0
  let onscreen = w[kCGWindowIsOnscreen as String] as? Bool ?? false
  let b = w[kCGWindowBounds as String] as? [String: Any] ?? [:]
  print("pid=\(pid) id=\(num) layer=\(layer) onscreen=\(onscreen) bounds=\(b["Width"] ?? 0)x\(b["Height"] ?? 0) name=\(name)")
}
