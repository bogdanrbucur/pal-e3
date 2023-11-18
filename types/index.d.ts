// index.d.ts
declare module "pal-e3" {
	export class PALAPI {
		getQDMSdocsByFolderId(folderId: string): Promise<QDMSdoc[]>;
	}
}
