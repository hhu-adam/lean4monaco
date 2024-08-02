import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default {
  entry: ['./src/webview/webview.ts'],
  mode: "production",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
            {
              loader: 'ts-loader',
              options: {
                compilerOptions: {"declaration": false}
              }
            }
        ],
        exclude: /node_modules/
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[hash].[ext]',
              outputPath: 'media/',
              publicPath: 'media/',
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'webview.js',
    path: path.resolve(__dirname, 'dist/webview'),
  },
}