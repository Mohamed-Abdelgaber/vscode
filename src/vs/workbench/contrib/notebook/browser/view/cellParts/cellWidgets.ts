/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as DOM from 'vs/base/browser/dom';
import { Disposable } from 'vs/base/common/lifecycle';
import { ElementSizeObserver } from 'vs/editor/browser/config/elementSizeObserver';
import { IDimension } from 'vs/editor/common/editorCommon';

export interface IClickTarget {
	type: ClickTargetType;
	event: MouseEvent;
}

export const enum ClickTargetType {
	Container = 0,
	ContributedTextItem = 1,
	ContributedCommandItem = 2
}

declare const ResizeObserver: any;

export interface IResizeObserver {
	startObserving: () => void;
	stopObserving: () => void;
	getWidth(): number;
	getHeight(): number;
	dispose(): void;
}

export class BrowserResizeObserver extends Disposable implements IResizeObserver {
	private readonly referenceDomElement: HTMLElement | null;

	private readonly observer: any;
	private width: number;
	private height: number;

	constructor(referenceDomElement: HTMLElement | null, dimension: IDimension | undefined, changeCallback: () => void) {
		super();

		this.referenceDomElement = referenceDomElement;
		this.width = -1;
		this.height = -1;

		this.observer = new ResizeObserver((entries: any) => {
			for (const entry of entries) {
				if (entry.target === referenceDomElement && entry.contentRect) {
					if (this.width !== entry.contentRect.width || this.height !== entry.contentRect.height) {
						this.width = entry.contentRect.width;
						this.height = entry.contentRect.height;
						DOM.scheduleAtNextAnimationFrame(() => {
							changeCallback();
						});
					}
				}
			}
		});
	}

	getWidth(): number {
		return this.width;
	}

	getHeight(): number {
		return this.height;
	}

	startObserving(): void {
		this.observer.observe(this.referenceDomElement!);
	}

	stopObserving(): void {
		this.observer.unobserve(this.referenceDomElement!);
	}

	override dispose(): void {
		this.observer.disconnect();
		super.dispose();
	}
}

export function getResizesObserver(referenceDomElement: HTMLElement | null, dimension: IDimension | undefined, changeCallback: () => void): IResizeObserver {
	if (ResizeObserver) {
		return new BrowserResizeObserver(referenceDomElement, dimension, changeCallback);
	} else {
		return new ElementSizeObserver(referenceDomElement, dimension, changeCallback);
	}
}
