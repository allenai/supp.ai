declare module "react-social-sharing" {
    interface ShareButtonProps {
        simple?: boolean;
        simpleReverse?: boolean;
        name?: string;
        solidcircle?: boolean;
        circle?: boolean;
        big?: boolean;
    }

    interface TwitterProps extends ShareButtonProps {
        link: string;
        message?: string;
    }

    interface FacebookProps extends ShareButtonProps {
        link: string;
    }

    interface RedditProps extends ShareButtonProps {
        link: string;
    }

    export const Twitter: React.FunctionComponent<TwitterProps>;
    export const Facebook: React.FunctionComponent<Facebook>;
    export const Reddit: React.FunctionComponent<RedditProps>;
}
