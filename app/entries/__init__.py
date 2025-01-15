from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for
)
from datetime import date

from ..db import get_db_connection
from ..auth import permission_required

bp = Blueprint('entries', __name__, template_folder="templates", static_folder="static")


"""
    Main page / dashboard
"""
@bp.route('/')
def dashboard():
    if g.user is None: # Return to landing page if user is not logged in
        return render_template('index.html')
    
    db = get_db_connection()
            
    entries = db.execute( # Fetch all entries
        '''
            SELECT *
            FROM entries
            WHERE user_id = ?
        ''', (g.user['id'], )
    ).fetchall()
    
    return render_template('dashboard.html', entries=entries, entry_date=date.today())


'''
    Create an entry, update the weight if the 
    an entry with the same date already exists
'''
@bp.route('/create', methods=('POST',))
@permission_required
def create():
    entry_date = request.form['entryDate']
    weight = "{:.1f}".format(float(request.form['weight'])) 
    error = None
    
    db = get_db_connection()
    
    if not weight:
        error = 'Weight is required'
    if not entry_date:
        error = 'Date is required'
    if error is not None:
        flash(error)
    else:
        try: # Add an entry
            db.execute(
                '''
                    INSERT INTO entries (user_id, entry_date, weight)
                    VALUES (?, ?, ?)
                ''', (g.user['id'], entry_date, weight)
            )
        except db.IntegrityError: # Update entry with matching date
            db.execute(
                '''
                    UPDATE entries
                    SET weight = ?
                    WHERE entry_date = ?
                ''', (weight, entry_date)
            )
        db.commit()
    return redirect(url_for('entries.dashboard'))


@bp.route('/delete/<int:id>', methods=('POST',))
@permission_required
def delete(id):
    db = get_db_connection()
    db.execute(
        '''
            DELETE FROM entries
            WHERE id = ?
        ''', (id, )
    )
    db.commit()
    return redirect(url_for('entries.dashboard'))
 
 # make it so when you click an entry it loads the date into the add entry form
@bp.route('/update/<int:id>', methods=('POST',))
@permission_required
def update(id):
    weight = "{:.1f}".format(float(request.form['weight'])) 
    error = None

    if not weight:
        error = 'Weight is required.'
    if error is not None:
        flash(error)
    else:
        db = get_db_connection()
        db.execute(
            '''
                UPDATE entries 
                SET weight = ?
                WHERE id = ?
            ''', (weight, id)
        )
        db.commit()
    return redirect(url_for('entries.dashboard'))

@bp.route('/graph', methods=('GET',))
@permission_required
def graph():
    return render_template('graph.html')