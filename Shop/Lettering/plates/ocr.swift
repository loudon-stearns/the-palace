// Lettering — rich face workshop: Apple Vision OCR over image paths (born 2026-11-03; [[Lettering]]). swiftc -O ocr.swift -o ocr; ./ocr <png>…
import Foundation
import Vision
import AppKit
for path in CommandLine.arguments.dropFirst() {
  guard let img = NSImage(contentsOfFile: path), let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else { print("\(path)\tERR"); continue }
  let req = VNRecognizeTextRequest()
  req.recognitionLevel = .accurate
  req.usesLanguageCorrection = false
  let h = VNImageRequestHandler(cgImage: cg, options: [:])
  try? h.perform([req])
  let lines = (req.results ?? []).compactMap { $0.topCandidates(1).first }.map { "\($0.string)@\(String(format: "%.2f", $0.confidence))" }
  print("\(path)\t\(lines.joined(separator: " | "))")
}
