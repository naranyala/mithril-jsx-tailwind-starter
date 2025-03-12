# mithril.js starter

```ts
import m from "mithril";
import { signal, computed, effect } from "@preact/signals";
import mitt from "mitt";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const bus = mitt();
const count = signal(0);

bus.on("counter:increment", () => count.value++);
bus.on("counter:decrement", () => count.value--);

const Button = {
	view: ({ attrs: { name, onclick } }) => {
		return (
			<button
				onclick={onclick}
				class="m-2 p-2 rounded-xl bg-blue-400 hover:bg-blue-500"
			>
				{name ?? "sample"}
			</button>
		);
	},
};

export default {
	view: () => {
		const doubled = computed(() => count.value * 2);

		effect(() => {
			console.log(`${count.value} - ${doubled.value}`);
		});

		return (
			<div class="flex flex-wrap justify-center items-center text-center m-4 p-4">
				<Button
					name="increment"
					onclick={() => bus.emit("counter:increment")}
				/>
				<h2 class="my-8">
					{count.value} - {doubled.value}
				</h2>
				<Button
					name="decrement"
					onclick={() => bus.emit("counter:decrement")}
				/>
			</div>
		);
	},
};
```
