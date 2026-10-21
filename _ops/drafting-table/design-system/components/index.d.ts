// Drafting Table — component props. Documentation; mirrors components/bundle.js (window.DraftingTable).
import type { CSSProperties, ReactNode } from 'react';

/** Where a value came from. The sheet's legend, read onto a plugin:
 *  design = set here · datasheet = the host wrote it (automation, preset) ·
 *  assumed = modulated / not at rest · measure = unknown or failed (red; a HOLD). */
export type Source = 'design' | 'datasheet' | 'assumed' | 'measure';

/** One row of a plugin's parameter table, after tpl::ParamSpec (VST Template). */
export interface ParamSpec {
  /** Stable host id. */
  id?: string;
  /** What the host shows; the control's default label. */
  name?: string;
  /** "Hz", "dB", "" … */
  unit?: string;
  min: number;
  max: number;
  /** Default, in natural units; double-click a control to return to it. */
  def: number;
  /** Linear or Log (min > 0) for Knob and Fader. Choice and Toggle have their own components. */
  taper?: 'Linear' | 'Log' | 'Choice' | 'Toggle';
  /** Optional quantisation step in natural units. */
  step?: number;
}

interface Base { className?: string; style?: CSSProperties; }

export interface TitleBlockProps extends Base {
  /** Set uppercase by the component. */
  name: string;
  subtitle?: string;
  /** Drawing / plugin number, e.g. "FRU-01". */
  number?: string;
  version?: string;
  /** Units or scale note, e.g. "mm" or "1x". */
  unit?: string;
  /** What is unproven: "SKETCH · HOLD: bolt pattern unmeasured". */
  status?: string;
  /** Colour of the status line; defaults to measure (red). */
  statusSource?: Source;
  /** The sketch or file it came from. */
  source?: string;
  /** ISO date. */
  drawn?: string;
  maker?: string;
  tool?: string;
}

export interface PanelProps extends Base {
  /** Eyebrow caption on the top edge. */
  caption?: string;
  /** card: 1px hairline (default) · sheet: 2px frame · slab: a solid surface · recess: a well. */
  variant?: 'card' | 'sheet' | 'slab' | 'recess';
  children?: ReactNode;
}

export interface DimensionProps extends Base {
  /** Uppercase label between the two arrowed lines. */
  label: string;
  orientation?: 'horizontal' | 'vertical';
  /** Fixed length in px; else it fills its flex parent. */
  length?: number | string;
  source?: Source;
}

export interface LegendItem { source: Source; name: string; what: string; }
export interface LegendProps extends Base {
  /** Defaults to the four sources as the CAD sheets word them. */
  items?: LegendItem[];
}

interface ControlBase extends Base {
  spec?: ParamSpec;
  /** Natural units. Uncontrolled: omit and the default shows. */
  value?: number;
  onChange?: (value: number) => void;
  /** Overrides spec.name. */
  label?: string;
  /** Colours the readout. */
  source?: Source;
  /** Decimal places; default picks by magnitude. */
  places?: number;
  format?: (value: number) => string;
  hideValue?: boolean;
  disabled?: boolean;
}

export interface KnobProps extends ControlBase {
  /** Diameter in px: 72 main, 56 secondary, 40 dense. */
  size?: number;
  /** Tick count on the track; default 5. */
  ticks?: number;
}

export interface FaderProps extends ControlBase {
  /** Travel height in px; default 160. */
  height?: number;
  /** Scale marks in natural units; default min, mid, max. */
  marks?: number[];
  markFormat?: (value: number) => string;
}

export interface ToggleProps extends Base {
  label?: string;
  /** 0 or 1, as Taper::Toggle hands it to the algorithm. */
  value?: number | boolean;
  onChange?: (value: 0 | 1) => void;
  /** ["OFF","ON"] by default. */
  stateLabels?: [string, string];
  hideState?: boolean;
  disabled?: boolean;
}

export interface ChoiceProps extends Base {
  label?: string;
  /** "40|64|96" as in ParamSpec, or an array. */
  choices: string | string[];
  /** The index, as Taper::Choice hands it to the algorithm. */
  value?: number;
  onChange?: (index: number) => void;
  disabled?: boolean;
}

export interface ButtonProps extends Base {
  /** press (default): momentary · latch: on/off with aria-pressed · quiet: hairline, no slab. */
  variant?: 'press' | 'latch' | 'quiet';
  label?: string;
  children?: ReactNode;
  /** Latch state. */
  value?: number | boolean;
  onChange?: (value: 0 | 1) => void;
  onClick?: (e: unknown) => void;
  /** A small round LED before the label, lit when latched on. */
  led?: boolean;
  pressed?: boolean;
  disabled?: boolean;
}

export interface ReadoutProps extends Base {
  label?: string;
  value?: number | string;
  unit?: string;
  places?: number;
  source?: Source;
  /** recess: set into a well instead of a hairline cell. */
  variant?: 'cell' | 'recess';
}

export interface MeterMark { at: number; label: string; }
export interface MeterProps extends Base {
  /** 0..1 */
  level?: number;
  /** 0..1; drawn as a red line. */
  peak?: number;
  orientation?: 'vertical' | 'horizontal';
  /** Trough length in px; 160 vertical, 200 horizontal. */
  length?: number;
  marks?: MeterMark[];
  hideScale?: boolean;
  label?: string;
}

export interface ScopeProps extends Base {
  /** -1..1 per sample; a demo sine when omitted. */
  samples?: number[] | Float32Array;
  /** A second trace, amber. */
  samples2?: number[] | Float32Array;
  width?: number;
  height?: number;
  /** Graticule columns; default 8. */
  divisions?: number;
  label?: string;
  /** Right-hand caption, e.g. "2 ms/div". */
  meta?: string;
}

export declare const TitleBlock: (p: TitleBlockProps) => JSX.Element;
export declare const Panel: (p: PanelProps) => JSX.Element;
export declare const Dimension: (p: DimensionProps) => JSX.Element;
export declare const Legend: (p: LegendProps) => JSX.Element;
export declare const Knob: (p: KnobProps) => JSX.Element;
export declare const Fader: (p: FaderProps) => JSX.Element;
export declare const Toggle: (p: ToggleProps) => JSX.Element;
export declare const Choice: (p: ChoiceProps) => JSX.Element;
export declare const Button: (p: ButtonProps) => JSX.Element;
export declare const Readout: (p: ReadoutProps) => JSX.Element;
export declare const Meter: (p: MeterProps) => JSX.Element;
export declare const Scope: (p: ScopeProps) => JSX.Element;
