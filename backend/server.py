import csv
import os
import time

from flask import Flask, request, send_from_directory, send_file
from flask_cors import CORS
import Analysis


app = Flask(__name__, static_folder='./build/')
CORS(app)

analysis = Analysis.Analysis()


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


@app.route('/get_tweets', methods=['POST'])
def get_tweets():
    request_body = request.get_json()

    time_frame = None
    counties = None
    account_type_list = None

    try:
        time_frame = request_body[0].split(' ')
        counties = request_body[1]
        account_type_list = request_body[2]
    except Exception as E:
        print(E, "Something went wrong with extracting time frame and county")

    tweets = analysis.get_filtered_tweets(time_frame, counties, account_type_list)

    return tweets


@app.route('/get_terms', methods=['POST'])
def get_terms():
    request_body = request.get_json()
    type_of_cloud = request_body[0]
    tweets = request_body[1]
    if not type_of_cloud:
        type_of_cloud = ["Non-Geo Tags"]

    print(type_of_cloud)
    result = analysis.get_key_words_frequency(tweets, type_of_cloud)
    return result


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
