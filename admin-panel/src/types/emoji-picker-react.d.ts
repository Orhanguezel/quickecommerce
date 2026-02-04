declare module 'emoji-picker-react' {
  import { ComponentType } from 'react';
  
  interface EmojiPickerProps {
    onEmojiClick: (event: any, emojiObject: any) => void;
    disableSearchBar?: boolean;
    disableSkinTonePicker?: boolean;
    // Add other props as needed
  }
  
  const EmojiPicker: ComponentType<EmojiPickerProps>;
  export default EmojiPicker;
}