import {
    Bold, Italic, Heading1, Heading2, Heading3, Heading4, Heading5,
    Table2Icon, StrikethroughIcon, Minus as LineIcon, Link as LinkIcon,
    Image as ImageIcon, List, ListOrdered, Quote, Code,
} from "lucide-react";

export const COMMAND_ICONS = Object.freeze({
    bold: Bold, italic: Italic, header1: Heading1, header2: Heading2,
    header3: Heading3, header4: Heading4, header5: Heading5, link: LinkIcon,
    image: ImageIcon, code: Code, strike: StrikethroughIcon, hr: LineIcon,
    table: Table2Icon, quote: Quote, ul: List, ol: ListOrdered,
});
