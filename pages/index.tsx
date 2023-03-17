// 参考 : https://typescriptbook.jp/tutorials/nextjs

import { NextPage, GetServerSideProps } from "next";
import { type } from "os";
import { useEffect, useState } from "react";
import styles from "./index.module.css";

// 型 getServerSidePropsから渡されるpropsの型
type Props = {
    initialImageUrl: string;
};

// ページコンポーネント関数にpropsを受け取る引数(initialImageUrl)を設定する
const IndexPage: NextPage<Props> = ({initialImageUrl}) => {
    // 1 useStateを使って状態を定義する
    const [imageUrl, setImageUrl] = useState(initialImageUrl); //初期値を渡す
    const [loading, setLoading] = useState(false); //初期値はfalseに設定する

    // 2 マウント時に画像を読み込む宣言
    /* getServerSidePropsで初期画像を設定したので、ここの処理は不要になる！
    useEffect(() => {
        fetchImage().then((newImage) => {
            setImageUrl(newImage.url); //画像URLの状態を更新する
            setLoading(false); //ローディング状態を更新する
        });
    }, []); //useEffectの第1引数に処理内容。第2引数に[]空配列を指定。「コンポーネントがマウントされた時のみ実行する」という意味。
    */

    const handleClick = async () => {
        setLoading(true);
        const newImage = await fetchImage();
        setImageUrl(newImage.url);
        setLoading(false);
    };

    // ローディング中でなければ画像を表示する
    return (
        <div className={styles.page}>
            <button onClick={handleClick} className={styles.button}>
                他のにゃんこも見る
            </button>
            <div className={styles.frame}>
                {loading || <img src={imageUrl} className={styles.img} />}
            </div>
        </div>
    )
}

// サーバーサイドで実行する処理
export const getServerSideProps: GetServerSideProps<Props> = async () => {
    const image = await fetchImage();
    return {
        props: {
            initialImageUrl: image.url,
        },
    };
};

// 型 Imageを定義
type Image = {
    id: string;
    url: string;
};

// 猫画像のAPIの呼び出し
const fetchImage = async (): Promise<Image> => {
    const url = "https://api.thecatapi.com/v1/images/search";
    const res = await fetch(url);

    const images: unknown = await res.json();
    if (!Array.isArray(images)) {
        throw new Error("猫の画像が取得できませんでした - 1");
    }

    const image = images[0];
    if (!isImage(image)) {
        throw new Error("猫の画像が取得できませんでした - 2");
    }
    return image;
}

// imageの検証関数
const isImage = (value: unknown): value is Image => {
    if (!value || typeof value !== 'object') {
        return false;
    }
    return "url" in value && typeof value.url === 'string';
}

// 実行
export default IndexPage;