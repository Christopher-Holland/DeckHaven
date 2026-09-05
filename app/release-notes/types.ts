export type ReleaseSection = {
    heading: string;
    items: string[];
};

export type ReleaseNote = {
    /** URL segment, e.g. "v1.0" → /release-notes/v1.0 */
    slug: string;
    version: string;
    title: string;
    date: string;
    summary: string;
    sections: ReleaseSection[];
};
