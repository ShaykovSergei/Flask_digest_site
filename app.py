from flask import Flask, render_template, jsonify
import json

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/cards')
def get_cards():
    with open('content.json', 'r', encoding='utf-8') as f:
        cards = json.load(f)
    return jsonify(cards)

@app.route('/api/tags')
def get_tags():
    with open('content.json', 'r', encoding='utf-8') as f:
        cards = json.load(f)
    tags = set()
    for card in cards:
        for tag in card['tags']:
            tags.add(tag)
    return jsonify(sorted(list(tags)))

if __name__ == '__main__':
    app.run(debug=True)
