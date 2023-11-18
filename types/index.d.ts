// index.d.ts
declare module "pal-e3" {
	export class PALAPI {
		constructor();
		getCookie(): void;
		getQDMSdocsByFolderId(folderId: string): Promise<QDMSdoc[]>;
	}
}
